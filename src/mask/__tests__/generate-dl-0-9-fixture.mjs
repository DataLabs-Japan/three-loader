/**
 * Generate the dl.0.9 expectations that `cuboid-masking.test.ts` asserts against.
 *
 * Run inside a **dl.0.9 checkout** — the point is that the numbers come out of the code that
 * shipped, not out of a description of it:
 *
 *   node <this file> /path/to/three-loader-at-dl.0.9 > src/mask/__tests__/cuboid-masking.dl-0-9.json
 *
 * The boxes are prepared by that checkout's own `Potree.setMaskConfig`, and the opacity rule is
 * the loop from its `pointcloud.frag`: inside is `abs(dot(toFragment, axis)) <= halfExtent` on
 * each of the three axes, a point inside any box takes the **largest** opacity among the boxes
 * containing it, and a point inside none takes `opacityOutOfMasks`. That loop is the one piece
 * that cannot be executed here — it is GLSL — so it is transcribed, and kept to the six lines it
 * is in the shader so the two can be read side by side.
 *
 * Points within `SURFACE_EPSILON` of a box face are dropped rather than recorded. The current
 * implementation packs into a `Float32Array`, and a point that close to a face can round to
 * either side of it; that is a property of a float texture, not a behavioural difference, and
 * asserting on it would make the fixture flaky rather than strict.
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const checkout = process.argv[2];
if (!checkout) {
  console.error('usage: node generate-dl-0-9-fixture.mjs <path-to-dl.0.9-checkout>');
  process.exit(1);
}

/**
 * The bundle probes WebGL capabilities at import time. Every probe guards on a null context, so a
 * canvas that returns one is enough to load it under Node — nothing here touches rendering.
 */
globalThis.document = { createElement: () => ({ getContext: () => null }) };

/** The loader also builds a decoder worker pool on import. Nothing here decodes anything. */
globalThis.Worker = class {
  postMessage() {}
  terminate() {}
  addEventListener() {}
  removeEventListener() {}
};

const { Potree } = await import(pathToFileURL(path.join(checkout, 'dist', 'index.js')).href);
const { Euler, Matrix3, Matrix4, Vector3 } = await import(
  pathToFileURL(path.join(checkout, 'node_modules', 'three', 'build', 'three.module.js')).href
);

const SURFACE_EPSILON = 1e-3;

/** Deterministic, so the fixture is reproducible from the same checkout. */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeBox(next, id, opacity) {
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

function samplePoints(next, cuboids, count) {
  const points = [];
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

/** `checkWithinCuboid` from dl.0.9's `pointcloud.frag`, over a box this checkout prepared. */
function localOffsets(prepared, point) {
  const toFragment = point.clone().sub(prepared.center);
  return [
    Math.abs(toFragment.dot(prepared.axisX)),
    Math.abs(toFragment.dot(prepared.axisY)),
    Math.abs(toFragment.dot(prepared.axisZ)),
  ];
}

function halfExtentsOf(prepared) {
  return [prepared.halfExtents.x, prepared.halfExtents.y, prepared.halfExtents.z];
}

function scenario(name, cuboids, defaultOpacity, points) {
  const potree = new Potree();
  // The checkout's own preparation — `extent` halved, the rotation's columns normalized.
  potree.setMaskConfig({ cuboids, defaultOpacity });
  const prepared = potree.masks.cuboids;

  const cases = [];
  let nearSurface = 0;
  let inside = 0;

  for (const point of points) {
    const offsets = prepared.map(box => localOffsets(box, point));
    const halves = prepared.map(halfExtentsOf);

    const ambiguous = offsets.some((offset, i) =>
      offset.some((value, axis) => Math.abs(value - halves[i][axis]) < SURFACE_EPSILON),
    );
    if (ambiguous) {
      nearSurface += 1;
      continue;
    }

    // The fragment loop: max over every containing box, else the outside opacity.
    let isInAny = false;
    let overrideOpacity = 0;
    prepared.forEach((box, i) => {
      if (offsets[i].every((value, axis) => value <= halves[i][axis])) {
        isInAny = true;
        overrideOpacity = Math.max(overrideOpacity, box.opacity);
      }
    });

    if (isInAny) inside += 1;
    cases.push({
      point: [point.x, point.y, point.z],
      expected: isInAny ? overrideOpacity : defaultOpacity,
    });
  }

  return {
    name,
    defaultOpacity,
    cuboids: cuboids.map(c => ({
      id: c.id,
      center: [c.center.x, c.center.y, c.center.z],
      rotation: c.rotation,
      extent: [c.extent.x, c.extent.y, c.extent.z],
      opacity: c.opacity,
    })),
    counts: { cases: cases.length, inside, nearSurface },
    cases,
  };
}

const scenarios = [];

{
  const next = rng(20260929);
  const cuboids = Array.from({ length: 12 }, (_, i) => makeBox(next, `box-${i}`, 1));
  scenarios.push(scenario('one opacity', cuboids, 0, samplePoints(next, cuboids, 4000)));
}

{
  const next = rng(775);
  const cuboids = Array.from({ length: 8 }, (_, i) => {
    const box = makeBox(next, `box-${i}`, 0.2 + (i % 4) * 0.25);
    box.center.multiplyScalar(0.25); // clustered, so the boxes overlap
    return box;
  });
  scenarios.push(
    scenario('differing opacities, overlapping', cuboids, 0, samplePoints(next, cuboids, 4000)),
  );
}

{
  const next = rng(4242);
  const cuboids = Array.from({ length: 6 }, (_, i) => makeBox(next, `box-${i}`, 1));
  const points = samplePoints(next, cuboids, 2000);
  for (const defaultOpacity of [0, 0.1, 0.5, 1]) {
    scenarios.push(scenario(`outside at ${defaultOpacity}`, cuboids, defaultOpacity, points));
  }
}

{
  const next = rng(9090);
  const cuboids = Array.from({ length: 6 }, (_, i) =>
    makeBox(next, `box-${i}`, i % 2 === 0 ? 0 : 0.3),
  );
  scenarios.push(scenario('hides its inside', cuboids, 1, samplePoints(next, cuboids, 3000)));
}

{
  const cuboids = [
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
  scenarios.push(scenario('the single box from the docs', cuboids, 0, points));
}

process.stdout.write(
  `${JSON.stringify(
    { generatedFrom: 'dl.0.9', surfaceEpsilon: SURFACE_EPSILON, scenarios },
    null,
    2,
  )}\n`,
);
