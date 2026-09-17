import {
  MASK_FLAG_EXCLUDE,
  MASK_FLAG_PRISM,
  MASK_HEADER_TEXELS,
  MASK_MAX_PRISM_VERTICES,
  MASK_MAX_REGIONS,
  MASK_PRISM_HEADER_TEXELS,
  MASK_TEXTURE_HEIGHT,
  MASK_TEXTURE_WIDTH,
} from './constants';

const f = (value: number): string => value.toFixed(1);

/**
 * Marker a shader carries where the mask chunk belongs — after its precision block, before it is
 * used. Replaced with {@link MASK_GLSL_CHUNK} when the mask path is compiled in.
 */
export const MASK_CHUNK_TOKEN = '//__MASK_CHUNK__';

/**
 * The masking containment test and the ordered painting loop, as GLSL a consuming material can
 * inject verbatim.
 *
 * It reports *inside* and *opacity*; what a shader does with them — discard, dim, tint — stays the
 * caller's business. The layout constants are interpolated from `mask/constants`, so a consumer
 * never hard-codes a texel offset, and the chunk cannot drift from the packer.
 *
 * Written to GLSL ES 1.00 rules (float index arithmetic, `texture2D`, constant loop bounds) so it
 * compiles unchanged in this library's `RawShaderMaterial` point cloud shader and in a plain
 * three.js material, which three.js compiles as GLSL ES 3.00.
 *
 * The consuming material must declare the `uMaskRegionTex` uniform and bind the packed texture.
 */
export const MASK_GLSL_CHUNK = `
uniform sampler2D uMaskRegionTex;

#define MASK_TEX_WIDTH ${f(MASK_TEXTURE_WIDTH)}
#define MASK_TEX_INV_WIDTH ${1 / MASK_TEXTURE_WIDTH}
#define MASK_TEX_INV_HEIGHT ${1 / MASK_TEXTURE_HEIGHT}
#define MASK_HEADER_TEXELS ${f(MASK_HEADER_TEXELS)}
#define MASK_MAX_REGIONS ${MASK_MAX_REGIONS}
#define MASK_MAX_PRISM_VERTICES ${MASK_MAX_PRISM_VERTICES}
#define MASK_PRISM_HEADER_TEXELS ${f(MASK_PRISM_HEADER_TEXELS)}
#define MASK_FLAG_PRISM ${f(MASK_FLAG_PRISM)}
#define MASK_FLAG_EXCLUDE ${f(MASK_FLAG_EXCLUDE)}

/* Texel at an absolute index. The reciprocals are exact powers of two, so the row/column split is
   exact for every index the layout can produce. */
vec4 maskTexel(float index) {
  float row = floor(index * MASK_TEX_INV_WIDTH);
  float col = index - row * MASK_TEX_WIDTH;
  return texture2D(uMaskRegionTex, vec2((col + 0.5) * MASK_TEX_INV_WIDTH, (row + 0.5) * MASK_TEX_INV_HEIGHT));
}

/* One flattened prism vertex; two share a texel. */
vec2 maskPrismVertex(float base, float index) {
  float pair = floor(index * 0.5);
  vec4 texel = maskTexel(base + pair);
  return (index - pair * 2.0 < 0.5) ? texel.xy : texel.zw;
}

bool maskCuboidContains(float base, vec3 worldPos) {
  mat4 inverseModel = mat4(
    maskTexel(base),
    maskTexel(base + 1.0),
    maskTexel(base + 2.0),
    maskTexel(base + 3.0)
  );
  vec3 local = (inverseModel * vec4(worldPos, 1.0)).xyz;
  vec3 lower = maskTexel(base + 4.0).xyz;
  vec3 upper = maskTexel(base + 5.0).xyz;
  return all(greaterThanEqual(local, lower)) && all(lessThanEqual(local, upper));
}

/* A closed outline extruded infinitely both ways along its plane normal: only the in-plane
   position decides. The prism has no finite world AABB to reject against — it is unbounded along
   its normal — so the exact in-plane bounds do that job before the crossing loop, which at the
   vertex cap would otherwise be 100 edge tests per fragment. */
bool maskPrismContains(float base, vec3 worldPos) {
  vec4 head = maskTexel(base);
  float vertexCount = head.w;
  vec3 axisU = maskTexel(base + 1.0).xyz;
  vec3 axisW = maskTexel(base + 2.0).xyz;
  vec4 bounds = maskTexel(base + 3.0);

  vec3 offset = worldPos - head.xyz;
  vec2 flat2 = vec2(dot(offset, axisU), dot(offset, axisW));
  if (flat2.x < bounds.x || flat2.y < bounds.y || flat2.x > bounds.z || flat2.y > bounds.w) {
    return false;
  }

  float vertexBase = base + MASK_PRISM_HEADER_TEXELS;
  bool inside = false;
  vec2 previous = maskPrismVertex(vertexBase, vertexCount - 1.0);
  for (int i = 0; i < MASK_MAX_PRISM_VERTICES; i++) {
    if (float(i) >= vertexCount) break;
    vec2 current = maskPrismVertex(vertexBase, float(i));
    if (((current.y > flat2.y) != (previous.y > flat2.y)) &&
        (flat2.x < (previous.x - current.x) * (flat2.y - current.y) / (previous.y - current.y) + current.x)) {
      inside = !inside;
    }
    previous = current;
  }
  return inside;
}

/* How many regions the mask holds. Zero means nothing is masked at all — which is not the same as
   a mask that hides everything, and a consumer that treats the two alike blanks its own scene the
   moment an area has no mask. */
float maskRegionCount() {
  return maskTexel(0.0).x;
}

/* Walk the regions in order.

   Within a group — one mask — the last match wins, so an outline can carve a hole out of an
   earlier one and a further outline can put part of that hole back. Separate groups are unioned:
   an exclude in one mask can never erase what another mask kept, which is why the group's verdict
   is only folded in once the group ends. Regions of a group arrive contiguously, so a change of
   group index is the end of one.

   **The group's first operation seeds it.** A leading include starts from nothing and grows —
   "keep only what I outlined". A leading exclude starts from everything and shrinks — "hide what
   I outlined". Both are legitimate masks, and the difference is invisible unless the seed is
   implemented: seeding empty regardless would render a mask that opens with an exclude as an
   empty scene, which is not what the detector produces from the same regions.

   A point no group kept takes the outside-everything default. */
float maskEvaluate(vec3 worldPos, out bool inside) {
  vec4 header = maskTexel(0.0);
  float regionCount = header.x;
  float defaultOpacity = header.y;

  inside = false;
  float result = defaultOpacity;

  float group = -1.0;
  bool groupInside = false;
  float groupOpacity = 0.0;

  for (int i = 0; i < MASK_MAX_REGIONS; i++) {
    if (float(i) >= regionCount) break;
    vec4 entry = maskTexel(MASK_HEADER_TEXELS + float(i));

    if (entry.w != group) {
      if (groupInside) {
        inside = true;
        result = groupOpacity;
      }
      group = entry.w;
      // This entry is the group's first, so its operation is the seed.
      groupInside = entry.x >= MASK_FLAG_EXCLUDE;
      groupOpacity = entry.z;
    }

    bool isPrism = mod(entry.x, 2.0) >= 0.5;
    bool hit = isPrism ? maskPrismContains(entry.y, worldPos) : maskCuboidContains(entry.y, worldPos);
    if (hit) {
      if (entry.x >= MASK_FLAG_EXCLUDE) {
        groupInside = false;
      } else {
        groupInside = true;
        groupOpacity = entry.z;
      }
    }
  }

  if (groupInside) {
    inside = true;
    result = groupOpacity;
  }

  return result;
}
`;
