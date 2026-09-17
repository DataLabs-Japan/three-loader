/**
 * Layout of the mask region texture.
 *
 * Every consumer — this library's point cloud shader, the exported GLSL chunk, and any other
 * renderer a project masks with the same data — reads the layout from here. Nothing hard-codes a
 * texel offset.
 *
 * The texture is a **fixed 64 x 64 RGBA float** grid (64 KB). Fixed rather than "as tall as the
 * data needs" for two reasons: the shader can then resolve a texel index without knowing the
 * texture's height, and the texture is allocated once and only ever rewritten — a lasso mask
 * changes on every click, and reallocating a GPU texture per vertex is exactly the cost this
 * layout exists to avoid.
 */

/** Texels per texture row. */
export const MASK_TEXTURE_WIDTH = 64;

/** Rows in the texture. */
export const MASK_TEXTURE_HEIGHT = 64;

/** Total texels available. Worst-case content is ~2993, so the grid is never the binding limit. */
export const MASK_TEXTURE_TEXELS = MASK_TEXTURE_WIDTH * MASK_TEXTURE_HEIGHT;

/** Texels before the region directory: one header texel, `[regionCount, defaultOpacity, 0, 0]`. */
export const MASK_HEADER_TEXELS = 1;

/**
 * Directory slots, one texel each: `[flags, payloadOffset, opacity, group]`.
 *
 * The directory is a fixed block so a region's slot is `MASK_HEADER_TEXELS + index` regardless of
 * how many regions are packed.
 */
export const MASK_MAX_REGIONS = 256;

/** First texel of the payload area, which the directory's offsets point into. */
export const MASK_PAYLOAD_OFFSET = MASK_HEADER_TEXELS + MASK_MAX_REGIONS;

/** Cuboid payload: the inverse model matrix (4 texels) then its local `min` and `max`. */
export const MASK_CUBOID_PAYLOAD_TEXELS = 6;

/**
 * Prism payload header, before the flattened vertex pairs: `[v0, vertexCount]`, `u`, `w`, and the
 * 2D bounding box `[minU, minW, maxU, maxW]` of the flattened outline.
 */
export const MASK_PRISM_HEADER_TEXELS = 4;

/** Vertices one prism may carry. The consumer enforces the same cap at draw time. */
export const MASK_MAX_PRISM_VERTICES = 100;

/** Vertices a whole mask may carry across all of its prisms. */
export const MASK_MAX_TOTAL_VERTICES = 2800;

/**
 * A directory texel's first channel: the region's kind and operation as two flag bits, so the
 * fourth channel is free to carry the group.
 */
export const MASK_FLAG_PRISM = 1;
export const MASK_FLAG_EXCLUDE = 2;

/**
 * How far a prism's vertices may sit off their fitted plane, in metres, before the outline is
 * treated as non-planar and rejected. A caller that freezes its drawing plane makes the deviation
 * zero by construction, so a non-zero value means something upstream is wrong.
 */
export const MASK_COPLANARITY_TOLERANCE = 0.1;

/** Texels a prism of `vertexCount` vertices occupies (two flattened vertices per texel). */
export const prismPayloadTexels = (vertexCount: number): number =>
  MASK_PRISM_HEADER_TEXELS + Math.ceil(vertexCount / 2);
