import { Box3, Vector2, Vector3 } from 'three';

/** The shapes a mask region can take. */
export enum MaskRegionKind {
  Cuboid = 'cuboid',
  Prism = 'prism',
}

/**
 * What a region does to the points it contains. Regions are painted in order, so a later region
 * overwrites an earlier one where they overlap: an outline can carve a hole out of an earlier
 * one, and a further outline can put part of that hole back.
 */
export enum MaskOperation {
  /** Points inside take the region's opacity. */
  Include = 'include',
  /** Points inside fall back to the outside-everything default, as if no region covered them. */
  Exclude = 'exclude',
}

/** An oriented box. Unchanged from the cuboid-only mask, plus the discriminant. */
export interface MaskCuboid {
  kind?: MaskRegionKind.Cuboid;
  id: string;
  /**
   * Regions sharing a group are one mask, evaluated in order among themselves; separate groups are
   * unioned. Defaults to the region's own index, which makes every region its own mask — so an
   * `exclude` in one mask can never erase what another mask kept. Regions of a group must be
   * given contiguously.
   */
  group?: number;
  /** Centre in world space. */
  center: Vector3;
  /** 3x3 rotation as a 9-element column-major array. */
  rotation: number[];
  /** Total size (half-extents are derived). */
  extent: Vector3;
  /** Opacity for points inside. */
  opacity: number;
}

/**
 * A closed coplanar outline extruded infinitely both ways along its plane normal. It has no depth
 * and no caps: only a point's in-plane position decides whether it is inside.
 */
export interface MaskPrism {
  kind: MaskRegionKind.Prism;
  id: string;
  /** See {@link MaskCuboid.group}. */
  group?: number;
  /**
   * The outline's world-space vertices, as an **open** ring — the closing edge runs from the last
   * vertex back to the first, so the first vertex is never repeated at the end.
   */
  positions: Vector3[];
  /** Defaults to {@link MaskOperation.Include}. */
  operation?: MaskOperation;
  /** Opacity for points inside (ignored for an `exclude` prism). */
  opacity: number;
}

export type MaskRegion = MaskCuboid | MaskPrism;

/** @deprecated The cuboid-only input name. Use {@link MaskCuboid}. */
export type Cuboid = MaskCuboid;

export interface MaskConfig {
  /** The mask's regions, **in order** — later regions paint over earlier ones. */
  regions: MaskRegion[];
  /** Opacity for points inside no region (or inside only `exclude` regions). */
  defaultOpacity: number;
}

/** A prism's fitted plane basis and the outline flattened onto it. */
export interface PrismBasis {
  /** The outline's first vertex; the origin the flattened coordinates are measured from. */
  origin: Vector3;
  /** Unit in-plane axis. */
  u: Vector3;
  /** Unit in-plane axis, perpendicular to `u`. */
  w: Vector3;
  /** Unit plane normal, `u x a` for the vertex `a` farthest off the `(origin, u)` line. */
  normal: Vector3;
  /** The outline flattened into `(u, w)`, one entry per input vertex. */
  flat: Vector2[];
  /** Axis-aligned bounds of `flat` — the exact in-plane rejection test for the prism. */
  bounds2D: { minU: number; minW: number; maxU: number; maxW: number };
  /** The largest distance any vertex sits off the fitted plane. */
  deviation: number;
}

/** A region prepared for packing: geometry resolved, ready to write into the texture. */
export interface PreparedMaskCuboid {
  kind: MaskRegionKind.Cuboid;
  id: string;
  opacity: number;
  operation: MaskOperation;
  group: number;
  center: Vector3;
  halfExtents: Vector3;
  axisX: Vector3;
  axisY: Vector3;
  axisZ: Vector3;
  /** World-space AABB bounding the oriented box, for node culling. */
  bbox: Box3;
}

export interface PreparedMaskPrism {
  kind: MaskRegionKind.Prism;
  id: string;
  opacity: number;
  operation: MaskOperation;
  group: number;
  basis: PrismBasis;
  vertexCount: number;
}

export type PreparedMaskRegion = PreparedMaskCuboid | PreparedMaskPrism;

/** The packed texture contents, plus the prepared regions the packing was derived from. */
export interface PackedMask {
  /** `MASK_TEXTURE_WIDTH * MASK_TEXTURE_HEIGHT * 4` floats, laid out per `mask/constants`. */
  data: Float32Array;
  /** The regions actually packed — trailing regions are dropped if the payload area fills up. */
  regions: PreparedMaskRegion[];
  /** Opacity for points inside no region. */
  defaultOpacity: number;
}
