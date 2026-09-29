import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import { packMaskRegions } from '../packing';
import { MaskCuboid } from '../types';
import { evaluatePackedMask } from './evaluate';

/**
 * What a box mask renders a point at, held against the opacities dl.0.9 produced.
 *
 * The expectations are not written here and are not derived here. They come out of
 * `cuboid-masking.dl-0-9.json`, which `generate-dl-0-9-fixture.mjs` produces by running a dl.0.9
 * checkout's own `Potree.setMaskConfig` — so the boxes are prepared by the code that shipped
 * rather than by a description of it. Were the expectations computed in this file, a test passing
 * here would only say the current implementation agrees with whatever was typed alongside it.
 *
 * Regenerate against a dl.0.9 checkout, never against this branch:
 *
 *   node src/mask/__tests__/generate-dl-0-9-fixture.mjs /path/to/three-loader-at-dl.0.9 \
 *     > src/mask/__tests__/cuboid-masking.dl-0-9.json
 */
interface Fixture {
  generatedFrom: string;
  surfaceEpsilon: number;
  scenarios: {
    name: string;
    defaultOpacity: number;
    cuboids: {
      id: string;
      center: [number, number, number];
      rotation: number[];
      extent: [number, number, number];
      opacity: number;
    }[];
    counts: { cases: number; inside: number; nearSurface: number };
    cases: { point: [number, number, number]; expected: number }[];
  }[];
}

const fixture: Fixture = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'cuboid-masking.dl-0-9.json'), 'utf8'),
);

describe(`box masking against ${fixture.generatedFrom}`, () => {
  it('reads a fixture with something in it', () => {
    // A fixture that lost its cases, or its points inside a box, would let every assertion below
    // pass over nothing at all.
    expect(fixture.generatedFrom).toBe('dl.0.9');
    expect(fixture.scenarios.length).toBeGreaterThanOrEqual(5);

    const total = fixture.scenarios.reduce((sum, s) => sum + s.cases.length, 0);
    const inside = fixture.scenarios.reduce((sum, s) => sum + s.counts.inside, 0);
    expect(total).toBeGreaterThan(10000);
    expect(inside).toBeGreaterThan(total * 0.1);

    for (const scenario of fixture.scenarios) {
      expect(scenario.cases.length, scenario.name).toBe(scenario.counts.cases);
    }
  });

  for (const scenario of fixture.scenarios) {
    it(`renders ${scenario.name} as dl.0.9 did`, () => {
      const cuboids: MaskCuboid[] = scenario.cuboids.map(box => ({
        id: box.id,
        center: new Vector3(...box.center),
        rotation: box.rotation,
        extent: new Vector3(...box.extent),
        opacity: box.opacity,
      }));

      const packed = packMaskRegions(cuboids, scenario.defaultOpacity);
      const disagreements: string[] = [];

      for (const { point, expected } of scenario.cases) {
        const actual = evaluatePackedMask(packed, new Vector3(...point)).opacity;
        if (Math.abs(actual - expected) > 1e-6) {
          disagreements.push(
            `(${point.map(v => v.toFixed(3)).join(', ')}): dl.0.9 ${expected}, now ${actual}`,
          );
        }
      }

      expect(disagreements.slice(0, 10)).toEqual([]);
      expect(disagreements.length).toBe(0);
    });
  }
});
