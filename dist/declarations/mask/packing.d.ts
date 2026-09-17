import { DataTexture } from 'three';
import { MaskRegion, PackedMask } from './types';
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
export declare function packMaskRegions(regions: MaskRegion[], defaultOpacity: number): PackedMask;
/** Create the `DataTexture` the masking shaders sample. Nearest-filtered — these are not pixels. */
export declare function createMaskDataTexture(packed?: PackedMask): DataTexture;
/**
 * Write a packing into an existing texture and flag it for upload.
 *
 * The texture's dimensions never change, so this is the whole update path: a mask that changes on
 * every click costs one buffer rewrite and one upload, never a reallocation and never a shader
 * recompile.
 */
export declare function writeMaskDataTexture(texture: DataTexture, packed: PackedMask): void;
