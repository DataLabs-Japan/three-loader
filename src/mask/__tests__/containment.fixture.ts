import { Vector3 } from 'three';
import { MaskOperation, MaskRegion, MaskRegionKind } from '../types';

/**
 * The containment fixture.
 *
 * The GLSL test and the TypeScript test are the one unavoidable duplicate in the masking
 * mechanism, so they are pinned to a shared set of cases rather than each being trusted on its
 * own. The TypeScript side is asserted against this in CI; the shader side is read against it by
 * eye, case by case, whenever the chunk changes.
 *
 * Every case states its own reasoning, so a failure says what broke rather than which index.
 */

export interface ContainmentCase {
  name: string;
  region: MaskRegion;
  /** World points that must test inside. */
  inside: Vector3[];
  /** World points that must test outside. */
  outside: Vector3[];
}

/** A unit square in the z = 2 plane, wound counter-clockwise. */
const SQUARE_XY: Vector3[] = [
  new Vector3(0, 0, 2),
  new Vector3(4, 0, 2),
  new Vector3(4, 4, 2),
  new Vector3(0, 4, 2),
];

/** An L, to catch a test that only works for convex outlines. */
const L_SHAPE: Vector3[] = [
  new Vector3(0, 0, 0),
  new Vector3(6, 0, 0),
  new Vector3(6, 2, 0),
  new Vector3(2, 2, 0),
  new Vector3(2, 6, 0),
  new Vector3(0, 6, 0),
];

/** The same square, wound the other way — containment must not depend on winding. */
const SQUARE_CW: Vector3[] = [...SQUARE_XY].reverse();

/** A square standing in the x = 1 plane, so the extrusion runs along x. */
const SQUARE_YZ: Vector3[] = [
  new Vector3(1, -1, -1),
  new Vector3(1, 1, -1),
  new Vector3(1, 1, 1),
  new Vector3(1, -1, 1),
];

/**
 * A square whose first three vertices are nearly coincident. A basis taken from `positions[0..2]`
 * is near-degenerate here; the farthest-pair fit is not.
 */
const SQUARE_CLUSTERED_START: Vector3[] = [
  new Vector3(0, 0, 0),
  new Vector3(0.001, 0, 0),
  new Vector3(0.002, 0.001, 0),
  new Vector3(10, 0, 0),
  new Vector3(10, 10, 0),
  new Vector3(0, 10, 0),
];

export const CONTAINMENT_CASES: ContainmentCase[] = [
  {
    name: 'prism: axis-aligned square, inside at every depth',
    region: { kind: MaskRegionKind.Prism, id: 'square', positions: SQUARE_XY, opacity: 1 },
    // The prism is infinite along its normal, so depth never decides.
    inside: [
      new Vector3(2, 2, 2),
      new Vector3(2, 2, 1000),
      new Vector3(2, 2, -1000),
      new Vector3(0.01, 0.01, 0),
    ],
    outside: [
      new Vector3(-0.5, 2, 2),
      new Vector3(5, 2, 2),
      new Vector3(2, 5, 0),
      new Vector3(4.5, 4.5, -50),
    ],
  },
  {
    name: 'prism: winding does not change the answer',
    region: { kind: MaskRegionKind.Prism, id: 'square-cw', positions: SQUARE_CW, opacity: 1 },
    inside: [new Vector3(2, 2, 2), new Vector3(2, 2, -30)],
    outside: [new Vector3(5, 2, 2), new Vector3(2, -1, 2)],
  },
  {
    name: 'prism: concave L — the notch is outside',
    region: { kind: MaskRegionKind.Prism, id: 'l-shape', positions: L_SHAPE, opacity: 1 },
    inside: [new Vector3(1, 1, 0), new Vector3(5, 1, 40), new Vector3(1, 5, -40)],
    // Inside the outline's bounding box but in the notch the L cuts out.
    outside: [new Vector3(5, 5, 0), new Vector3(3, 4, 0), new Vector3(5.5, 5.5, 12)],
  },
  {
    name: 'prism: plane standing on end, extrusion along x',
    region: { kind: MaskRegionKind.Prism, id: 'square-yz', positions: SQUARE_YZ, opacity: 1 },
    inside: [new Vector3(1, 0, 0), new Vector3(-500, 0, 0), new Vector3(500, 0.5, -0.5)],
    outside: [new Vector3(1, 2, 0), new Vector3(0, 0, 2), new Vector3(-500, -1.5, 0)],
  },
  {
    name: 'prism: clustered opening vertices still fit a stable basis',
    region: {
      kind: MaskRegionKind.Prism,
      id: 'clustered',
      positions: SQUARE_CLUSTERED_START,
      opacity: 1,
    },
    inside: [new Vector3(5, 5, 0), new Vector3(5, 5, 200), new Vector3(9.9, 0.5, 0)],
    outside: [new Vector3(11, 5, 0), new Vector3(5, 11, 0), new Vector3(-1, 5, -200)],
  },
  {
    name: 'prism: an exclude region is contained the same way — the operation is not containment',
    region: {
      kind: MaskRegionKind.Prism,
      id: 'excluded',
      positions: SQUARE_XY,
      operation: MaskOperation.Exclude,
      opacity: 1,
    },
    inside: [new Vector3(2, 2, 2)],
    outside: [new Vector3(6, 6, 2)],
  },
  {
    name: 'cuboid: axis-aligned box',
    region: {
      id: 'box',
      center: new Vector3(0, 0, 0),
      rotation: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      extent: new Vector3(4, 4, 4),
      opacity: 1,
    },
    inside: [new Vector3(0, 0, 0), new Vector3(1.9, 1.9, 1.9), new Vector3(-2, -2, -2)],
    outside: [new Vector3(2.1, 0, 0), new Vector3(0, 0, 3), new Vector3(3, 3, 3)],
  },
  {
    name: 'cuboid: rotated 45 degrees about z',
    region: {
      id: 'box-rot',
      center: new Vector3(0, 0, 0),
      // Column-major: the box's local x and y axes run along the world diagonals.
      rotation: [Math.SQRT1_2, Math.SQRT1_2, 0, -Math.SQRT1_2, Math.SQRT1_2, 0, 0, 0, 1],
      extent: new Vector3(2, 2, 2),
      opacity: 1,
    },
    // The box is 2 across its own axes, which run along the world diagonals: it reaches 1 along a
    // diagonal but sqrt(2) along a world axis. A test that ignored the rotation would get both of
    // these backwards.
    inside: [new Vector3(0, 0, 0), new Vector3(0.7, 0.7, 0), new Vector3(1.3, 0, 0)],
    outside: [new Vector3(1.5, 1.5, 0), new Vector3(1.45, 0, 0)],
  },
];
