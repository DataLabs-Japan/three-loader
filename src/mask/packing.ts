import { ClampToEdgeWrapping, DataTexture, FloatType, NearestFilter, RGBAFormat } from 'three';
import {
  MASK_CUBOID_PAYLOAD_TEXELS,
  MASK_FLAG_EXCLUDE,
  MASK_FLAG_PRISM,
  MASK_HEADER_TEXELS,
  MASK_MAX_REGIONS,
  MASK_MAX_TOTAL_VERTICES,
  MASK_PAYLOAD_OFFSET,
  MASK_PRISM_HEADER_TEXELS,
  MASK_TEXTURE_HEIGHT,
  MASK_TEXTURE_TEXELS,
  MASK_TEXTURE_WIDTH,
  prismPayloadTexels,
} from './constants';
import { cuboidInverseModelMatrix, prepareMaskRegion } from './geometry';
import { MaskOperation, MaskRegion, MaskRegionKind, PackedMask, PreparedMaskRegion } from './types';

/**
 * Pack mask regions into the texture the masking shaders read.
 *
 * Standalone so a consumer with no point cloud in the scene can mask its own materials with the
 * very same data. A project that packs its own would be building a second mask that agrees with
 * this one only by luck of the inputs — and for a prism, where a basis fitted two ways is two
 * different masks, not even that.
 *
 * Regions past the directory or payload capacity are **dropped**, not truncated: a prism cut short
 * is a different outline, and silently masking by a different shape is worse than masking by one
 * region fewer. The consumer enforces the same caps at draw time, so this is a backstop.
 *
 * @param regions The mask's regions, in order — later regions paint over earlier ones.
 * @param defaultOpacity Opacity for points inside no region.
 */
export function packMaskRegions(regions: MaskRegion[], defaultOpacity: number): PackedMask {
  const data = new Float32Array(MASK_TEXTURE_TEXELS * 4);
  const packed: PreparedMaskRegion[] = [];

  let payloadCursor = MASK_PAYLOAD_OFFSET;
  let totalVertices = 0;

  for (let index = 0; index < regions.length; index++) {
    const region = regions[index];
    if (packed.length >= MASK_MAX_REGIONS) break;

    const prepared = prepareMaskRegion(region, index);
    if (!prepared) continue;

    const isPrism = prepared.kind === MaskRegionKind.Prism;
    const vertexCount = isPrism ? prepared.vertexCount : 0;
    if (isPrism && totalVertices + vertexCount > MASK_MAX_TOTAL_VERTICES) continue;

    const payloadLength = isPrism ? prismPayloadTexels(vertexCount) : MASK_CUBOID_PAYLOAD_TEXELS;
    if (payloadCursor + payloadLength > MASK_TEXTURE_TEXELS) break;

    // Directory slot: [flags, payloadOffset, opacity, group].
    const slot = (MASK_HEADER_TEXELS + packed.length) * 4;
    data[slot + 0] =
      (isPrism ? MASK_FLAG_PRISM : 0) +
      (prepared.operation === MaskOperation.Exclude ? MASK_FLAG_EXCLUDE : 0);
    data[slot + 1] = payloadCursor;
    data[slot + 2] = prepared.opacity;
    data[slot + 3] = prepared.group;

    const payload = payloadCursor * 4;
    if (prepared.kind === MaskRegionKind.Cuboid) {
      data.set(cuboidInverseModelMatrix(prepared).toArray(), payload);
      const { halfExtents } = prepared;
      data.set([-halfExtents.x, -halfExtents.y, -halfExtents.z, 0], payload + 16);
      data.set([halfExtents.x, halfExtents.y, halfExtents.z, 0], payload + 20);
    } else {
      const { basis } = prepared;
      data.set([basis.origin.x, basis.origin.y, basis.origin.z, vertexCount], payload);
      data.set([basis.u.x, basis.u.y, basis.u.z, 0], payload + 4);
      data.set([basis.w.x, basis.w.y, basis.w.z, 0], payload + 8);
      const { minU, minW, maxU, maxW } = basis.bounds2D;
      data.set([minU, minW, maxU, maxW], payload + 12);

      // Two flattened vertices per texel.
      const vertices = payload + MASK_PRISM_HEADER_TEXELS * 4;
      for (let i = 0; i < vertexCount; i++) {
        data[vertices + i * 2 + 0] = basis.flat[i].x;
        data[vertices + i * 2 + 1] = basis.flat[i].y;
      }
      totalVertices += vertexCount;
    }

    payloadCursor += payloadLength;
    packed.push(prepared);
  }

  // Header: [regionCount, defaultOpacity, 0, 0].
  data[0] = packed.length;
  data[1] = defaultOpacity;

  return { data, regions: packed, defaultOpacity };
}

/** Create the `DataTexture` the masking shaders sample. Nearest-filtered — these are not pixels. */
export function createMaskDataTexture(packed?: PackedMask): DataTexture {
  const data = packed ? packed.data : new Float32Array(MASK_TEXTURE_TEXELS * 4);
  const texture = new DataTexture(
    data,
    MASK_TEXTURE_WIDTH,
    MASK_TEXTURE_HEIGHT,
    RGBAFormat,
    FloatType,
  );
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Write a packing into an existing texture and flag it for upload.
 *
 * The texture's dimensions never change, so this is the whole update path: a mask that changes on
 * every click costs one buffer rewrite and one upload, never a reallocation and never a shader
 * recompile.
 */
export function writeMaskDataTexture(texture: DataTexture, packed: PackedMask): void {
  ((texture.image.data as unknown) as Float32Array).set(packed.data);
  texture.needsUpdate = true;
}
