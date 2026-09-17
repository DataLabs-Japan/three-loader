import { Box3, Matrix3, Matrix4, Quaternion, Vector2, Vector3 } from 'three';
import { MASK_MAX_PRISM_VERTICES } from './constants';
import {
  MaskCuboid,
  MaskOperation,
  MaskPrism,
  MaskRegion,
  MaskRegionKind,
  PreparedMaskCuboid,
  PreparedMaskRegion,
  PrismBasis,
} from './types';

/** Below this, two vertices are the same point and cannot define a direction. */
const DEGENERATE_EPSILON = 1e-6;

export function isPrismRegion(region: MaskRegion): region is MaskPrism {
  return region.kind === MaskRegionKind.Prism;
}

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
export function fitPrismBasis(positions: Vector3[]): PrismBasis | null {
  if (positions.length < 3) return null;

  const origin = positions[0];

  // Farthest vertex from the origin gives the best-conditioned in-plane direction.
  let farthest = -1;
  let farthestDistanceSq = 0;
  for (let i = 1; i < positions.length; i++) {
    const distanceSq = positions[i].distanceToSquared(origin);
    if (distanceSq > farthestDistanceSq) {
      farthestDistanceSq = distanceSq;
      farthest = i;
    }
  }
  if (farthest < 0 || farthestDistanceSq <= DEGENERATE_EPSILON * DEGENERATE_EPSILON) return null;

  const u = positions[farthest]
    .clone()
    .sub(origin)
    .normalize();

  // Then the vertex farthest off the (origin, u) line fixes the plane.
  const offset = new Vector3();
  const perpendicular = new Vector3();
  let offPlane: Vector3 | null = null;
  let offPlaneDistance = 0;
  for (let i = 1; i < positions.length; i++) {
    offset.subVectors(positions[i], origin);
    perpendicular.copy(offset).addScaledVector(u, -offset.dot(u));
    const distance = perpendicular.length();
    if (distance > offPlaneDistance) {
      offPlaneDistance = distance;
      offPlane = perpendicular.clone();
    }
  }
  if (!offPlane || offPlaneDistance <= DEGENERATE_EPSILON) return null;

  const normal = new Vector3().crossVectors(u, offPlane).normalize();
  const w = new Vector3().crossVectors(normal, u).normalize();

  const flat: Vector2[] = [];
  let minU = Infinity;
  let minW = Infinity;
  let maxU = -Infinity;
  let maxW = -Infinity;
  let deviation = 0;

  for (const position of positions) {
    offset.subVectors(position, origin);
    const coordU = offset.dot(u);
    const coordW = offset.dot(w);
    flat.push(new Vector2(coordU, coordW));
    if (coordU < minU) minU = coordU;
    if (coordW < minW) minW = coordW;
    if (coordU > maxU) maxU = coordU;
    if (coordW > maxW) maxW = coordW;
    deviation = Math.max(deviation, Math.abs(offset.dot(normal)));
  }

  return {
    origin: origin.clone(),
    u,
    w,
    normal,
    flat,
    bounds2D: { minU, minW, maxU, maxW },
    deviation,
  };
}

/**
 * Whether a flattened point falls inside a flattened outline, by the even-odd crossing rule.
 *
 * Winding-agnostic, and the ring closes through the index wrap — the outline never carries a
 * repeated closing vertex.
 */
export function isInsideFlatPolygon(flat: Vector2[], coordU: number, coordW: number): boolean {
  let inside = false;
  for (let i = 0, j = flat.length - 1; i < flat.length; j = i, i++) {
    const a = flat[i];
    const b = flat[j];
    if (
      a.y > coordW !== b.y > coordW &&
      coordU < ((b.x - a.x) * (coordW - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Whether a world point falls inside a prepared region.
 *
 * The CPU counterpart of the exported GLSL containment test — same basis, same rejection order,
 * same crossing rule — for callers that need the answer without a GPU (picking, draw-time
 * validation). The two implementations are pinned together by the containment fixture.
 */
export function isInsideMaskRegion(point: Vector3, region: PreparedMaskRegion): boolean {
  if (region.kind === MaskRegionKind.Cuboid) {
    const toPoint = point.clone().sub(region.center);
    return (
      Math.abs(toPoint.dot(region.axisX)) <= region.halfExtents.x &&
      Math.abs(toPoint.dot(region.axisY)) <= region.halfExtents.y &&
      Math.abs(toPoint.dot(region.axisZ)) <= region.halfExtents.z
    );
  }

  const { basis } = region;
  const offset = point.clone().sub(basis.origin);
  const coordU = offset.dot(basis.u);
  const coordW = offset.dot(basis.w);

  // The in-plane bounds are an exact rejection for a prism: it is infinite along its normal, so
  // its world AABB is unbounded and cannot reject anything, while the 2D box always can.
  const { minU, minW, maxU, maxW } = basis.bounds2D;
  if (coordU < minU || coordW < minW || coordU > maxU || coordW > maxW) return false;

  return isInsideFlatPolygon(basis.flat, coordU, coordW);
}

/**
 * Whether one mask keeps a world point — its regions evaluated in order.
 *
 * The CPU counterpart of the exported GLSL chunk's ordering loop, and the rule the detector
 * applies: the mask's **first operation seeds it**, then each region assigns. A leading include
 * starts from nothing and grows ("keep only what I outlined"); a leading exclude starts from
 * everything and shrinks ("hide what I outlined"). Seeding empty regardless would answer "nothing
 * is kept" for every mask that opens with an exclude.
 *
 * @param point The world point to test.
 * @param regions One mask's regions, in order. An empty list keeps nothing.
 */
export function isInsideMaskGroup(point: Vector3, regions: PreparedMaskRegion[]): boolean {
  if (regions.length === 0) return false;

  let inside = regions[0].operation === MaskOperation.Exclude;
  for (const region of regions) {
    if (!isInsideMaskRegion(point, region)) continue;
    inside = region.operation !== MaskOperation.Exclude;
  }
  return inside;
}

/** Whether a world-space box could contain any point of the region (conservative: may say yes). */
export function maskRegionIntersectsBox(region: PreparedMaskRegion, box: Box3): boolean {
  if (region.kind === MaskRegionKind.Cuboid) return box.intersectsBox(region.bbox);

  // Project the box's 8 corners into the prism's plane and compare 2D bounds. Conservative, but
  // far tighter than the prism's (infinite) world AABB, which rejects nothing at all.
  const { basis } = region;
  let minU = Infinity;
  let minW = Infinity;
  let maxU = -Infinity;
  let maxW = -Infinity;
  const corner = new Vector3();
  const offset = new Vector3();
  for (let i = 0; i < 8; i++) {
    corner.set(
      i & 1 ? box.max.x : box.min.x,
      i & 2 ? box.max.y : box.min.y,
      i & 4 ? box.max.z : box.min.z,
    );
    offset.subVectors(corner, basis.origin);
    const coordU = offset.dot(basis.u);
    const coordW = offset.dot(basis.w);
    if (coordU < minU) minU = coordU;
    if (coordW < minW) minW = coordW;
    if (coordU > maxU) maxU = coordU;
    if (coordW > maxW) maxW = coordW;
  }
  const bounds = basis.bounds2D;
  return minU <= bounds.maxU && maxU >= bounds.minU && minW <= bounds.maxW && maxW >= bounds.minW;
}

/**
 * Whether a world-space box lies wholly inside the region (conservative: may say no).
 *
 * Always `false` for a prism: "every corner is inside" does not imply the box is, once the
 * outline is concave, and a wrong `true` here culls a node that is partly visible.
 */
export function maskRegionContainsBox(region: PreparedMaskRegion, box: Box3): boolean {
  return region.kind === MaskRegionKind.Cuboid ? region.bbox.containsBox(box) : false;
}

/** Resolve a cuboid's world axes, half-extents and bounding AABB. */
function prepareCuboid(region: MaskCuboid): Omit<PreparedMaskCuboid, 'group'> {
  const { id, center, rotation, extent, opacity } = region;
  const halfExtents = extent.clone().multiplyScalar(0.5);
  const rot = new Matrix3().fromArray(rotation);

  // Column vectors = world-space axes
  const axisX = new Vector3(rot.elements[0], rot.elements[1], rot.elements[2]).normalize();
  const axisY = new Vector3(rot.elements[3], rot.elements[4], rot.elements[5]).normalize();
  const axisZ = new Vector3(rot.elements[6], rot.elements[7], rot.elements[8]).normalize();

  // AABB bounding the OBB: extend along each axis by the projection of all half-extents.
  const radius = new Vector3(
    Math.abs(axisX.x * halfExtents.x) +
      Math.abs(axisY.x * halfExtents.y) +
      Math.abs(axisZ.x * halfExtents.z),
    Math.abs(axisX.y * halfExtents.x) +
      Math.abs(axisY.y * halfExtents.y) +
      Math.abs(axisZ.y * halfExtents.z),
    Math.abs(axisX.z * halfExtents.x) +
      Math.abs(axisY.z * halfExtents.y) +
      Math.abs(axisZ.z * halfExtents.z),
  );

  return {
    kind: MaskRegionKind.Cuboid,
    id,
    opacity,
    operation: MaskOperation.Include,
    center: center.clone(),
    halfExtents,
    axisX,
    axisY,
    axisZ,
    bbox: new Box3(center.clone().sub(radius), center.clone().add(radius)),
  };
}

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
export function prepareMaskRegion(region: MaskRegion, index = 0): PreparedMaskRegion | null {
  const group = region.group ?? index;
  if (!isPrismRegion(region)) return { ...prepareCuboid(region), group };

  if (region.positions.length > MASK_MAX_PRISM_VERTICES) return null;
  const basis = fitPrismBasis(region.positions);
  if (!basis) return null;

  return {
    kind: MaskRegionKind.Prism,
    id: region.id,
    opacity: region.opacity,
    operation: region.operation ?? MaskOperation.Include,
    group,
    basis,
    vertexCount: region.positions.length,
  };
}

/**
 * The inverse model matrix of a prepared cuboid — world space into the box's local space, where
 * the axis-aligned half-extents decide containment. This is what the packed payload carries.
 */
export function cuboidInverseModelMatrix(region: PreparedMaskCuboid): Matrix4 {
  const rotation = new Matrix4().makeBasis(region.axisX, region.axisY, region.axisZ);
  return new Matrix4()
    .compose(region.center, new Quaternion().setFromRotationMatrix(rotation), new Vector3(1, 1, 1))
    .invert();
}
