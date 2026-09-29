import { Euler, Matrix3, Matrix4, Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { packMaskRegions } from '../packing';
import { MaskCuboid } from '../types';
import { evaluatePackedMask } from './evaluate';

/**
 * What dl.0.9 did with a list of boxes, transcribed from the code that shipped.
 *
 * Two pieces, both from `origin/master`: the preparation in `setMaskConfig` (`extent` halved,
 * the rotation's columns taken as the box's axes and normalized) and `checkWithinCuboid` in
 * `pointcloud.frag` (the fragment put into that local frame, inside when it clears none of the
 * half-extents). The opacity rule is the loop around it: **max** over every box containing the
 * point, and `opacityOutOfMasks` for a point inside none.
 *
 * This is the oracle the current implementation is held against — the claim in MASK_USAGE.md that
 * box masking is unchanged is only worth making if something checks it.
 */
function evaluateLegacyCuboids(
  cuboids: MaskCuboid[],
  defaultOpacity: number,
  point: Vector3,
): number {
  let isInAny = false;
  let overrideOpacity = 0;

  for (const cuboid of cuboids) {
    const halfExtents = cuboid.extent.clone().multiplyScalar(0.5);
    const rot = new Matrix3().fromArray(cuboid.rotation);
    const axisX = new Vector3(rot.elements[0], rot.elements[1], rot.elements[2]).normalize();
    const axisY = new Vector3(rot.elements[3], rot.elements[4], rot.elements[5]).normalize();
    const axisZ = new Vector3(rot.elements[6], rot.elements[7], rot.elements[8]).normalize();

    const toFragment = point.clone().sub(cuboid.center);
    const inside =
      Math.abs(toFragment.dot(axisX)) <= halfExtents.x &&
      Math.abs(toFragment.dot(axisY)) <= halfExtents.y &&
      Math.abs(toFragment.dot(axisZ)) <= halfExtents.z;

    if (inside) {
      isInAny = true;
      overrideOpacity = Math.max(overrideOpacity, cuboid.opacity);
    }
  }

  return isInAny ? overrideOpacity : defaultOpacity;
}

/** Deterministic, so a failure is reproducible rather than a story about one unlucky run. */
function rng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A box at an arbitrary orientation — the rotation written the way a caller writes it. */
function makeBox(next: () => number, id: string, opacity: number): MaskCuboid {
  const rotation = new Matrix3()
    .setFromMatrix4(
      new Matrix4().makeRotationFromEuler(
        new Euler(next() * Math.PI, next() * Math.PI, next() * Math.PI),
      ),
    )
    .toArray();

  return {
    id,
    center: new Vector3((next() - 0.5) * 40, (next() - 0.5) * 40, (next() - 0.5) * 40),
    rotation,
    extent: new Vector3(2 + next() * 10, 2 + next() * 10, 2 + next() * 10),
    opacity,
  };
}

/**
 * How close to a box's surface a point has to be before the two paths may legitimately disagree.
 *
 * The oracle runs in double precision; the current path goes through a `Float32Array`, so a point
 * sitting within rounding distance of a face can fall on either side of it. That is a property of
 * packing into a float texture, not a behavioural change, so those points are excluded rather than
 * asserted on — and counted, so the exclusion cannot quietly swallow the whole sample.
 */
const SURFACE_EPSILON = 1e-3;

function isNearAnySurface(cuboids: MaskCuboid[], point: Vector3): boolean {
  return cuboids.some(cuboid => {
    const halfExtents = cuboid.extent.clone().multiplyScalar(0.5);
    const rot = new Matrix3().fromArray(cuboid.rotation);
    const axes = [
      new Vector3(rot.elements[0], rot.elements[1], rot.elements[2]).normalize(),
      new Vector3(rot.elements[3], rot.elements[4], rot.elements[5]).normalize(),
      new Vector3(rot.elements[6], rot.elements[7], rot.elements[8]).normalize(),
    ];
    const toFragment = point.clone().sub(cuboid.center);
    const half = [halfExtents.x, halfExtents.y, halfExtents.z];
    return axes.some(
      (axis, i) => Math.abs(Math.abs(toFragment.dot(axis)) - half[i]) < SURFACE_EPSILON,
    );
  });
}

/**
 * Points spread over the scene, plus points aimed at the boxes themselves.
 *
 * Uniform sampling alone mostly misses: the boxes occupy a small part of the volume, and a test
 * that only ever agrees about "outside everything" agrees about nothing worth knowing.
 */
function samplePoints(next: () => number, cuboids: MaskCuboid[], count: number): Vector3[] {
  const points: Vector3[] = [];
  for (let i = 0; i < count; i += 1) {
    if (i % 2 === 0) {
      points.push(new Vector3((next() - 0.5) * 60, (next() - 0.5) * 60, (next() - 0.5) * 60));
    } else {
      const cuboid = cuboids[Math.floor(next() * cuboids.length)];
      const reach = Math.max(cuboid.extent.x, cuboid.extent.y, cuboid.extent.z) * 0.75;
      points.push(
        cuboid.center
          .clone()
          .add(new Vector3((next() - 0.5) * reach, (next() - 0.5) * reach, (next() - 0.5) * reach)),
      );
    }
  }
  return points;
}

/** Run both paths over the same boxes and points, and report what disagreed. */
function compare(cuboids: MaskCuboid[], defaultOpacity: number, points: Vector3[]) {
  const packed = packMaskRegions(cuboids, defaultOpacity);
  const disagreements: string[] = [];
  let compared = 0;
  let insideCount = 0;

  for (const point of points) {
    if (isNearAnySurface(cuboids, point)) continue;
    compared += 1;

    const legacy = evaluateLegacyCuboids(cuboids, defaultOpacity, point);
    const current = evaluatePackedMask(packed, point).opacity;
    if (legacy !== defaultOpacity) insideCount += 1;

    if (Math.abs(legacy - current) > 1e-6) {
      disagreements.push(
        `(${point.x.toFixed(3)}, ${point.y.toFixed(3)}, ${point.z.toFixed(
          3,
        )}): dl.0.9 ${legacy}, now ${current}`,
      );
    }
  }

  return { disagreements, compared, insideCount };
}

describe('box masking is unchanged from dl.0.9', () => {
  it('agrees everywhere for boxes at one opacity', () => {
    const next = rng(20260929);
    const cuboids = Array.from({ length: 12 }, (_, i) => makeBox(next, `box-${i}`, 1));
    const points = samplePoints(next, cuboids, 4000);

    const { disagreements, compared, insideCount } = compare(cuboids, 0, points);

    // The sample has to be worth something: most points survive the surface filter, and a healthy
    // share of them land inside a box rather than agreeing trivially about empty space.
    expect(compared).toBeGreaterThan(points.length * 0.9);
    expect(insideCount).toBeGreaterThan(compared * 0.1);
    expect(disagreements).toEqual([]);
  });

  it('agrees for boxes at differing opacities, overlaps included', () => {
    const next = rng(775);
    // Deliberately clustered, so boxes overlap and the max-opacity rule is actually exercised.
    const cuboids = Array.from({ length: 8 }, (_, i) => {
      const box = makeBox(next, `box-${i}`, 0.2 + (i % 4) * 0.25);
      box.center.multiplyScalar(0.25);
      return box;
    });
    const points = samplePoints(next, cuboids, 4000);

    const { disagreements, compared, insideCount } = compare(cuboids, 0, points);

    expect(compared).toBeGreaterThan(points.length * 0.9);
    expect(insideCount).toBeGreaterThan(compared * 0.1);
    expect(disagreements).toEqual([]);
  });

  it('agrees when the outside is dimmed rather than hidden', () => {
    const next = rng(4242);
    const cuboids = Array.from({ length: 6 }, (_, i) => makeBox(next, `box-${i}`, 1));
    const points = samplePoints(next, cuboids, 2000);

    for (const defaultOpacity of [0, 0.1, 0.5, 1]) {
      const { disagreements } = compare(cuboids, defaultOpacity, points);
      expect(disagreements, `defaultOpacity ${defaultOpacity}`).toEqual([]);
    }
  });

  it('agrees when a box hides its inside rather than revealing it', () => {
    // The second pattern the dl.0.9 docs showed: defaultOpacity 1, the box's own opacity 0.
    const next = rng(9090);
    const cuboids = Array.from({ length: 6 }, (_, i) =>
      makeBox(next, `box-${i}`, i % 2 === 0 ? 0 : 0.3),
    );
    const points = samplePoints(next, cuboids, 3000);

    const { disagreements, compared, insideCount } = compare(cuboids, 1, points);

    expect(compared).toBeGreaterThan(points.length * 0.9);
    expect(insideCount).toBeGreaterThan(0);
    expect(disagreements).toEqual([]);
  });

  it('agrees for a single box, the shape every caller starts from', () => {
    const cuboids: MaskCuboid[] = [
      {
        id: 'only',
        center: new Vector3(0, 0, 10),
        rotation: [1, 0, 0, 0, 1, 0, 0, 0, 1],
        extent: new Vector3(20, 20, 20),
        opacity: 1,
      },
    ];
    const points = [
      new Vector3(0, 0, 10),
      new Vector3(9, 9, 19),
      new Vector3(-9, -9, 1),
      new Vector3(11, 0, 10),
      new Vector3(0, 0, 21),
      new Vector3(100, 100, 100),
    ];

    for (const point of points) {
      const packed = packMaskRegions(cuboids, 0);
      expect(evaluatePackedMask(packed, point).opacity).toBe(
        evaluateLegacyCuboids(cuboids, 0, point),
      );
    }
  });
});
