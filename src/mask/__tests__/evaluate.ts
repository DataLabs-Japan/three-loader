import { Vector3 } from 'three';
import {
  MASK_FLAG_EXCLUDE,
  MASK_HEADER_TEXELS,
  MASK_MAX_PRISM_VERTICES,
  MASK_MAX_REGIONS,
  MASK_PRISM_HEADER_TEXELS,
  MASK_REJECT_OFFSET,
  MASK_REJECT_TEXELS,
  MASK_TEXTURE_WIDTH,
} from '../constants';
import { PackedMask } from '../types';

/**
 * `maskEvaluate` from `mask/glsl.ts`, transcribed line for line.
 *
 * The shader is the one piece of the masking mechanism a unit test cannot run, and the rules it
 * carries — ordered painting, first-operation seeding, the union across masks — are exactly the
 * ones that are invisible until a scene is wrong. This reads the real packed buffer, so a change
 * to the layout or to the loop that is not mirrored here shows up as a failure rather than as a
 * shader that quietly disagrees with everything else.
 *
 * Kept deliberately literal, statement by statement, so it can be diffed against the GLSL by eye.
 */
export function evaluatePackedMask(
  packed: PackedMask,
  worldPos: Vector3,
): { opacity: number; inside: boolean } {
  const texel = (index: number): [number, number, number, number] => {
    const row = Math.floor(index / MASK_TEXTURE_WIDTH);
    const col = index - row * MASK_TEXTURE_WIDTH;
    const at = (row * MASK_TEXTURE_WIDTH + col) * 4;
    return [packed.data[at], packed.data[at + 1], packed.data[at + 2], packed.data[at + 3]];
  };

  const prismVertex = (base: number, index: number): [number, number] => {
    const pair = Math.floor(index * 0.5);
    const t = texel(base + pair);
    return index - pair * 2 < 0.5 ? [t[0], t[1]] : [t[2], t[3]];
  };

  const cuboidContains = (base: number, p: Vector3): boolean => {
    const m = [texel(base), texel(base + 1), texel(base + 2), texel(base + 3)];
    // Column-major, as `mat4(vec4, vec4, vec4, vec4)` builds it.
    const local = [0, 1, 2].map(
      (axis) => m[0][axis] * p.x + m[1][axis] * p.y + m[2][axis] * p.z + m[3][axis],
    );
    const lower = texel(base + 4);
    const upper = texel(base + 5);
    return local.every((value, axis) => value >= lower[axis] && value <= upper[axis]);
  };

  const prismContains = (base: number, p: Vector3): boolean => {
    const head = texel(base);
    const vertexCount = head[3];
    const axisU = texel(base + 1);
    const axisW = texel(base + 2);
    const bounds = texel(base + 3);

    const offset = [p.x - head[0], p.y - head[1], p.z - head[2]];
    const flatU = offset[0] * axisU[0] + offset[1] * axisU[1] + offset[2] * axisU[2];
    const flatW = offset[0] * axisW[0] + offset[1] * axisW[1] + offset[2] * axisW[2];
    if (flatU < bounds[0] || flatW < bounds[1] || flatU > bounds[2] || flatW > bounds[3]) {
      return false;
    }

    const vertexBase = base + MASK_PRISM_HEADER_TEXELS;
    let inside = false;
    let previous = prismVertex(vertexBase, vertexCount - 1);
    for (let i = 0; i < MASK_MAX_PRISM_VERTICES; i++) {
      if (i >= vertexCount) break;
      const current = prismVertex(vertexBase, i);
      if (
        current[1] > flatW !== previous[1] > flatW &&
        flatU <
          ((previous[0] - current[0]) * (flatW - current[1])) / (previous[1] - current[1]) +
            current[0]
      ) {
        inside = !inside;
      }
      previous = current;
    }
    return inside;
  };

  const header = texel(0);
  const regionCount = header[0];
  const defaultOpacity = header[1];

  let inside = false;
  let keptOpacity = 0;
  let group = -1;
  let groupInside = false;
  let groupOpacity = 0;

  for (let i = 0; i < MASK_MAX_REGIONS; i++) {
    if (i >= regionCount) break;

    const rejectBase = MASK_REJECT_OFFSET + i * MASK_REJECT_TEXELS;
    const bound = texel(rejectBase);
    const axis = texel(rejectBase + 1);

    const groupAndFlags = axis[3];
    const entryGroup = Math.floor(groupAndFlags * 0.25);
    const flags = groupAndFlags - entryGroup * 4;

    const offset = [worldPos.x - bound[0], worldPos.y - bound[1], worldPos.z - bound[2]];
    const axial = offset[0] * axis[0] + offset[1] * axis[1] + offset[2] * axis[2];
    const radial = offset.map((value, index) => value - axial * axis[index]);
    const nearby =
      radial[0] * radial[0] + radial[1] * radial[1] + radial[2] * radial[2] <= bound[3] * bound[3];

    const startsGroup = entryGroup !== group;
    if (!startsGroup && !nearby) continue;

    const entry = texel(MASK_HEADER_TEXELS + i);

    if (startsGroup) {
      if (groupInside) {
        inside = true;
        keptOpacity = Math.max(keptOpacity, groupOpacity);
      }
      group = entryGroup;
      groupInside = flags >= MASK_FLAG_EXCLUDE;
      groupOpacity = entry[2];
    }

    if (!nearby) continue;

    const isPrism = flags % 2 >= 0.5;
    const hit = isPrism ? prismContains(entry[1], worldPos) : cuboidContains(entry[1], worldPos);
    if (hit) {
      if (flags >= MASK_FLAG_EXCLUDE) {
        groupInside = false;
      } else {
        groupInside = true;
        groupOpacity = entry[2];
      }
    }
  }

  if (groupInside) {
    inside = true;
    keptOpacity = Math.max(keptOpacity, groupOpacity);
  }

  return { opacity: inside ? keptOpacity : defaultOpacity, inside };
}
