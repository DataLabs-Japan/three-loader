import { Box3, Matrix4, Vector2, Vector3 } from 'three';
import { MaskPrism, MaskRegion, PreparedMaskCuboid, PreparedMaskRegion, PrismBasis } from './types';
export declare function isPrismRegion(region: MaskRegion): region is MaskPrism;
/**
 * Fit a plane basis to a prism's outline and flatten the outline onto it.
 *
 * `u` runs from the first vertex to the vertex **farthest from it**, and the normal is fitted
 * against the vertex **farthest from that line**. Picking the farthest pair is what makes the
 * basis well conditioned: taking `positions[0..2]` blindly gives a near-degenerate basis whenever
 * the first three vertices happen to be close together, and the fitted normal then swings wildly
 * for outlines that are geometrically the same.
 *
 * @param positions The outline's world-space vertices, as an open ring.
 * @returns The basis, or `null` when the outline has fewer than 3 vertices, repeats a single
 *   point, or is entirely collinear (zero area — no plane to fit).
 */
export declare function fitPrismBasis(positions: Vector3[]): PrismBasis | null;
/**
 * Whether a flattened point falls inside a flattened outline, by the even-odd crossing rule.
 *
 * Winding-agnostic, and the ring closes through the index wrap — the outline never carries a
 * repeated closing vertex.
 */
export declare function isInsideFlatPolygon(flat: Vector2[], coordU: number, coordW: number): boolean;
/**
 * Whether a world point falls inside a prepared region.
 *
 * The CPU counterpart of the exported GLSL containment test — same basis, same rejection order,
 * same crossing rule — for callers that need the answer without a GPU (picking, draw-time
 * validation). The two implementations are pinned together by the containment fixture.
 */
export declare function isInsideMaskRegion(point: Vector3, region: PreparedMaskRegion): boolean;
/** Whether a world-space box could contain any point of the region (conservative: may say yes). */
export declare function maskRegionIntersectsBox(region: PreparedMaskRegion, box: Box3): boolean;
/**
 * Whether a world-space box lies wholly inside the region (conservative: may say no).
 *
 * Always `false` for a prism: "every corner is inside" does not imply the box is, once the
 * outline is concave, and a wrong `true` here culls a node that is partly visible.
 */
export declare function maskRegionContainsBox(region: PreparedMaskRegion, box: Box3): boolean;
/**
 * Resolve a region's geometry once, so both the packing and the CPU containment test read the
 * same fitted basis rather than each fitting their own.
 *
 * @param region The region to prepare.
 * @param index Its position in the mask, used as its group when it names none.
 * @returns The prepared region, or `null` when a prism's outline is degenerate (fewer than 3
 *   vertices, all-collinear, or past the per-prism vertex cap) — a region that cannot be masked by
 *   is dropped rather than truncated into a different shape.
 */
export declare function prepareMaskRegion(region: MaskRegion, index?: number): PreparedMaskRegion | null;
/**
 * The inverse model matrix of a prepared cuboid — world space into the box's local space, where
 * the axis-aligned half-extents decide containment. This is what the packed payload carries.
 */
export declare function cuboidInverseModelMatrix(region: PreparedMaskCuboid): Matrix4;
