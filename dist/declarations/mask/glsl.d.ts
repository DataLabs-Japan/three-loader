/**
 * Marker a shader carries where the mask chunk belongs — after its precision block, before it is
 * used. Replaced with {@link MASK_GLSL_CHUNK} when the mask path is compiled in.
 */
export declare const MASK_CHUNK_TOKEN = "//__MASK_CHUNK__";
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
export declare const MASK_GLSL_CHUNK: string;
