import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import {
  MASK_FLAG_EXCLUDE,
  MASK_FLAG_PRISM,
  MASK_HEADER_TEXELS,
  MASK_MAX_REGIONS,
  MASK_PAYLOAD_OFFSET,
  MASK_REJECT_OFFSET,
  MASK_REJECT_TEXELS,
} from '../constants';
import {
  fitPrismBasis,
  isInsideMask,
  isInsideMaskGroup,
  isInsideMaskRegion,
  maskRejectBound,
  prepareMaskRegion,
} from '../geometry';
import { packMaskRegions } from '../packing';
import { MaskOperation, MaskRegionKind } from '../types';
import { CONTAINMENT_CASES } from './containment.fixture';
import { evaluatePackedMask } from './evaluate';

describe('mask containment', () => {
  for (const testCase of CONTAINMENT_CASES) {
    describe(testCase.name, () => {
      const prepared = prepareMaskRegion(testCase.region);

      it('prepares', () => {
        expect(prepared).not.toBeNull();
      });

      for (const point of testCase.inside) {
        it(`contains (${point.toArray().join(', ')})`, () => {
          expect(isInsideMaskRegion(point, prepared!)).toBe(true);
        });
      }

      for (const point of testCase.outside) {
        it(`excludes (${point.toArray().join(', ')})`, () => {
          expect(isInsideMaskRegion(point, prepared!)).toBe(false);
        });
      }
    });
  }
});

describe('prism basis', () => {
  it('rejects an outline with fewer than three vertices', () => {
    expect(fitPrismBasis([new Vector3(), new Vector3(1, 0, 0)])).toBeNull();
  });

  it('rejects a collinear outline — no plane to fit, and no area to be inside of', () => {
    expect(
      fitPrismBasis([new Vector3(0, 0, 0), new Vector3(1, 0, 0), new Vector3(2, 0, 0)]),
    ).toBeNull();
  });

  it('fits a basis whose axes are orthonormal', () => {
    const basis = fitPrismBasis([
      new Vector3(0, 0, 0),
      new Vector3(3, 1, 4),
      new Vector3(1, 5, 2),
      new Vector3(-2, 2, 1),
    ])!;
    expect(basis.u.length()).toBeCloseTo(1);
    expect(basis.w.length()).toBeCloseTo(1);
    expect(basis.normal.length()).toBeCloseTo(1);
    expect(basis.u.dot(basis.w)).toBeCloseTo(0);
    expect(basis.u.dot(basis.normal)).toBeCloseTo(0);
    expect(basis.w.dot(basis.normal)).toBeCloseTo(0);
  });

  it('reports the outline’s own coplanarity as its deviation', () => {
    const coplanar = fitPrismBasis([
      new Vector3(0, 0, 5),
      new Vector3(4, 0, 5),
      new Vector3(4, 4, 5),
      new Vector3(0, 4, 5),
    ])!;
    expect(coplanar.deviation).toBeCloseTo(0);

    const bent = fitPrismBasis([
      new Vector3(0, 0, 5),
      new Vector3(4, 0, 5),
      new Vector3(4, 4, 5.25),
      new Vector3(0, 4, 5),
    ])!;
    expect(bent.deviation).toBeGreaterThan(0.1);
  });
});

describe('ordered evaluation', () => {
  // Two overlapping squares in the same plane: `outer` contains `inner`.
  const outer = [
    new Vector3(0, 0, 0),
    new Vector3(10, 0, 0),
    new Vector3(10, 10, 0),
    new Vector3(0, 10, 0),
  ];
  const inner = [
    new Vector3(3, 3, 0),
    new Vector3(7, 3, 0),
    new Vector3(7, 7, 0),
    new Vector3(3, 7, 0),
  ];

  const group = (...regions: { positions: Vector3[]; operation?: MaskOperation }[]) =>
    regions
      .map((region, index) =>
        prepareMaskRegion(
          {
            kind: MaskRegionKind.Prism,
            id: `r${index}`,
            positions: region.positions,
            operation: region.operation,
            opacity: 1,
          },
          index,
        ),
      )
      .filter(region => region !== null);

  const inInner = new Vector3(5, 5, 0);
  const inOuterOnly = new Vector3(1, 1, 0);
  const outsideBoth = new Vector3(50, 50, 0);

  it('keeps only what a leading include outlines', () => {
    const mask = group({ positions: outer });
    expect(isInsideMaskGroup(inOuterOnly, mask)).toBe(true);
    expect(isInsideMaskGroup(outsideBoth, mask)).toBe(false);
  });

  it('keeps everything a leading exclude does NOT outline', () => {
    // The rule that seeding empty gets wrong: a mask opening with an exclude starts from the whole
    // cloud and shrinks it, so a point nowhere near it is still kept.
    const mask = group({ positions: inner, operation: MaskOperation.Exclude });
    expect(isInsideMaskGroup(inInner, mask)).toBe(false);
    expect(isInsideMaskGroup(outsideBoth, mask)).toBe(true);
    expect(isInsideMaskGroup(inOuterOnly, mask)).toBe(true);
  });

  it('lets a later outline paint over an earlier one, both ways', () => {
    const carved = group(
      { positions: outer },
      { positions: inner, operation: MaskOperation.Exclude },
    );
    expect(isInsideMaskGroup(inOuterOnly, carved)).toBe(true);
    expect(isInsideMaskGroup(inInner, carved)).toBe(false);

    const restored = group(
      { positions: outer },
      { positions: inner, operation: MaskOperation.Exclude },
      { positions: inner },
    );
    expect(isInsideMaskGroup(inInner, restored)).toBe(true);
  });

  it('keeps nothing for a mask with no regions', () => {
    expect(isInsideMaskGroup(inInner, [])).toBe(false);
  });
});

describe('packing', () => {
  const outline = [
    new Vector3(0, 0, 0),
    new Vector3(2, 0, 0),
    new Vector3(2, 2, 0),
    new Vector3(0, 2, 0),
  ];

  it('writes the region count and the outside-everything default into the header', () => {
    const packed = packMaskRegions(
      [{ kind: MaskRegionKind.Prism, id: 'a', positions: outline, opacity: 1 }],
      0.1,
    );
    expect(packed.data[0]).toBe(1);
    expect(packed.data[1]).toBeCloseTo(0.1);
  });

  it('keeps the regions in the order they were given', () => {
    const packed = packMaskRegions(
      [
        { kind: MaskRegionKind.Prism, id: 'first', positions: outline, opacity: 1 },
        {
          kind: MaskRegionKind.Prism,
          id: 'second',
          positions: outline,
          operation: MaskOperation.Exclude,
          opacity: 1,
        },
      ],
      0,
    );
    expect(packed.regions.map(region => region.id)).toEqual(['first', 'second']);

    const second = (MASK_HEADER_TEXELS + 1) * 4;
    expect(packed.data[second + 0]).toBe(MASK_FLAG_PRISM + MASK_FLAG_EXCLUDE);
  });

  it('gives every region its own group unless one is named, so masks cannot erase each other', () => {
    const ungrouped = packMaskRegions(
      [
        { kind: MaskRegionKind.Prism, id: 'a', positions: outline, opacity: 1 },
        { kind: MaskRegionKind.Prism, id: 'b', positions: outline, opacity: 1 },
      ],
      0,
    );
    const groupOf = (index: number) => ungrouped.data[(MASK_HEADER_TEXELS + index) * 4 + 3];
    expect(groupOf(0)).not.toBe(groupOf(1));

    const grouped = packMaskRegions(
      [
        { kind: MaskRegionKind.Prism, id: 'a', positions: outline, group: 7, opacity: 1 },
        {
          kind: MaskRegionKind.Prism,
          id: 'b',
          positions: outline,
          group: 7,
          operation: MaskOperation.Exclude,
          opacity: 1,
        },
      ],
      0,
    );
    // The packed number is the caller's renumbered densely — only equality between groups is ever
    // read, and a small one is what keeps `group * 4 + flags` exact in the reject texel.
    const groupedGroupOf = (index: number) => grouped.data[(MASK_HEADER_TEXELS + index) * 4 + 3];
    expect(groupedGroupOf(0)).toBe(groupedGroupOf(1));
    expect(groupedGroupOf(0)).toBeLessThan(MASK_MAX_REGIONS);
  });

  it('renumbers groups densely and packs each mask together, whatever order it arrived in', () => {
    const packed = packMaskRegions(
      [
        { kind: MaskRegionKind.Prism, id: 'a', positions: outline, group: 90000, opacity: 1 },
        { kind: MaskRegionKind.Prism, id: 'b', positions: outline, group: -4, opacity: 1 },
        { kind: MaskRegionKind.Prism, id: 'c', positions: outline, group: 90000, opacity: 1 },
      ],
      0,
    );
    // The shader reads a change of group as the end of a mask, so a mask split around another
    // would be read as two — each re-seeded from its own first operation.
    const groupOfPacked = (index: number) => packed.data[(MASK_HEADER_TEXELS + index) * 4 + 3];
    expect([groupOfPacked(0), groupOfPacked(1), groupOfPacked(2)]).toEqual([0, 0, 1]);
    expect(packed.regions.map((region) => region.id)).toEqual(['a', 'c', 'b']);

    // The reject texel's packed `group * 4 + flags` has to survive it exactly.
    const rejectAt = (index: number) =>
      packed.data[(MASK_REJECT_OFFSET + index * MASK_REJECT_TEXELS) * 4 + 7];
    expect(Math.floor(rejectAt(2) * 0.25)).toBe(1);
  });

  /**
   * A mask that does not fit is dropped whole.
   *
   * Half a mask is a different mask — the hole it carved comes back, or the exclude that seeded it
   * loses the outlines that gave it shape — and it fails without a sound. The masks around it are
   * unioned with it, not ordered against it, so they have no reason to go with it.
   */
  describe('a mask that does not fit', () => {
    const bigPrism = (id: string, group: number, vertexCount: number) => ({
      kind: MaskRegionKind.Prism as const,
      id,
      group,
      opacity: 1,
      positions: Array.from({ length: vertexCount }, (_, i) => {
        const angle = (i / vertexCount) * Math.PI * 2;
        return new Vector3(Math.cos(angle) * 10, Math.sin(angle) * 10, 0);
      }),
    });

    it('is dropped whole when its vertices pass the per-mask cap, and its neighbours are not', () => {
      const overCap = Array.from({ length: 29 }, (_, i) => bigPrism(`over-${i}`, 1, 100));
      const packed = packMaskRegions([...overCap, bigPrism('fits', 2, 100)], 0);

      expect(packed.regions.map((region) => region.id)).toEqual(['fits']);
      expect(packed.data[0]).toBe(1);
    });

    it('is dropped whole when the payload area cannot hold it, and a later smaller one still fits', () => {
      // Three masks of 2700 vertices each: the first two fill the payload area between them, and
      // the third cannot start. Truncating it would leave a mask missing its later outlines.
      const mask = (group: number) => Array.from({ length: 27 }, (_, i) => bigPrism(`m${group}-${i}`, group, 100));
      const packed = packMaskRegions([...mask(1), ...mask(2), ...mask(3), bigPrism('small', 4, 4)], 0);

      const groupsPacked = new Set(packed.regions.map((region) => region.group));
      for (const group of groupsPacked) {
        const packedOfGroup = packed.regions.filter((region) => region.group === group).length;
        const expected = group === 4 ? 1 : 27;
        expect(packedOfGroup, `mask ${group} was cut short`).toBe(expected);
      }
      // The small one is what proves a later mask is still considered rather than skipped with it.
      expect(groupsPacked.has(4)).toBe(true);
    });

    it('is dropped whole when the directory cannot hold it', () => {
      const wide = Array.from({ length: MASK_MAX_REGIONS }, (_, i) => bigPrism(`wide-${i}`, 1, 3));
      const packed = packMaskRegions([...wide, bigPrism('second', 2, 3)], 0);

      // The first mask fills the directory exactly; the second cannot start, and is not half-packed.
      expect(packed.regions.length).toBe(MASK_MAX_REGIONS);
      expect(packed.regions.every((region) => region.group === 1)).toBe(true);
    });
  });

  it('drops a degenerate outline rather than packing a different shape', () => {
    const packed = packMaskRegions(
      [
        {
          kind: MaskRegionKind.Prism,
          id: 'collinear',
          positions: [new Vector3(0, 0, 0), new Vector3(1, 0, 0), new Vector3(2, 0, 0)],
          opacity: 1,
        },
        { kind: MaskRegionKind.Prism, id: 'good', positions: outline, opacity: 1 },
      ],
      0,
    );
    expect(packed.regions.map(region => region.id)).toEqual(['good']);
    expect(packed.data[0]).toBe(1);
  });

  it('flattens the outline into the payload, two vertices per texel', () => {
    const packed = packMaskRegions(
      [{ kind: MaskRegionKind.Prism, id: 'a', positions: outline, opacity: 1 }],
      0,
    );
    const payload = MASK_PAYLOAD_OFFSET * 4;
    // First payload texel: the outline's first vertex, then its vertex count.
    expect(packed.data[payload + 3]).toBe(outline.length);

    // The flattened outline must round-trip through the packed basis back to the world points.
    const basis = packed.regions[0].kind === MaskRegionKind.Prism ? packed.regions[0].basis : null;
    expect(basis).not.toBeNull();
    outline.forEach((vertex, index) => {
      const rebuilt = basis!.origin
        .clone()
        .addScaledVector(basis!.u, basis!.flat[index].x)
        .addScaledVector(basis!.w, basis!.flat[index].y);
      expect(rebuilt.distanceTo(vertex)).toBeLessThan(1e-6);
    });
  });
});

/**
 * The reject bound is what the shader tests a fragment against before it reads anything else about
 * a region, so a bound that is too small is a hole in the mask that no containment test can catch.
 * Every case's inside points are checked against it here, the same way the shader checks them.
 */
describe('mask reject bound', () => {
  /** The shader's test, in TypeScript: inside the cylinder of `radius` about the axis line. */
  const isNearby = (bound: ReturnType<typeof maskRejectBound>, point: Vector3): boolean => {
    const offset = point.clone().sub(bound.centre);
    const radial = offset.clone().addScaledVector(bound.axis, -offset.dot(bound.axis));
    return radial.lengthSq() <= bound.radius * bound.radius + 1e-9;
  };

  for (const testCase of CONTAINMENT_CASES) {
    const prepared = prepareMaskRegion(testCase.region, 0);
    if (!prepared) continue;
    const bound = maskRejectBound(prepared);

    it(`${testCase.name}: holds every point inside the region`, () => {
      for (const point of testCase.inside) {
        expect(isNearby(bound, point), `${point.toArray().join(', ')} was rejected`).toBe(true);
      }
    });
  }

  it('holds a prism at any distance along its normal, which is where it runs to infinity', () => {
    const region = {
      id: 'deep',
      kind: MaskRegionKind.Prism as const,
      positions: [new Vector3(0, 0, 0), new Vector3(4, 0, 0), new Vector3(4, 4, 0), new Vector3(0, 4, 0)],
      opacity: 1,
    };
    const prepared = prepareMaskRegion(region, 0)!;
    const bound = maskRejectBound(prepared);

    // Straight up the normal from the middle of the outline: inside the prism at any height.
    for (const height of [0, 10, -10, 1000]) {
      expect(isNearby(bound, new Vector3(2, 2, height))).toBe(true);
    }
    // Far to the side, well past the outline: the bound has to let this one go.
    expect(isNearby(bound, new Vector3(100, 2, 0))).toBe(false);
  });

  it('bounds a box by a sphere, with no axis to project onto', () => {
    const region = {
      id: 'box',
      kind: MaskRegionKind.Cuboid as const,
      center: new Vector3(1, 2, 3),
      rotation: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      extent: new Vector3(2, 2, 2),
      opacity: 1,
    };
    const prepared = prepareMaskRegion(region, 0)!;
    const bound = maskRejectBound(prepared);

    expect(bound.axis.lengthSq()).toBe(0);
    // Every corner of the box, the farthest points it has.
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          expect(isNearby(bound, new Vector3(1 + sx, 2 + sy, 3 + sz))).toBe(true);
        }
      }
    }
    expect(isNearby(bound, new Vector3(20, 2, 3))).toBe(false);
  });
});

/**
 * The shader's own loop, against real packed buffers.
 *
 * `isInsideMaskGroup` answers for one mask, and the fixture above pins one region at a time — so
 * neither of them says anything about the rules that only appear once a scene holds more than one
 * mask: seeding, ordered painting, and the union that stops one mask erasing another. Those are
 * precisely the rules a wrong scene is made of.
 */
describe('mask evaluation, as the shader does it', () => {
  const square = (offsetX: number, size: number): Vector3[] => [
    new Vector3(offsetX, 0, 0),
    new Vector3(offsetX + size, 0, 0),
    new Vector3(offsetX + size, size, 0),
    new Vector3(offsetX, size, 0),
  ];

  const prism = (
    id: string,
    positions: Vector3[],
    extra: { group?: number; operation?: MaskOperation; opacity?: number } = {},
  ) => ({ kind: MaskRegionKind.Prism as const, id, positions, opacity: 1, ...extra });

  it('keeps what one mask keeps, whatever another mask hides', () => {
    // A keeps a big square. B is a separate mask that hides a small square far away, and being
    // seeded by an exclude it keeps everything else — including every point of A.
    const packed = packMaskRegions(
      [
        prism('a', square(0, 10), { group: 0 }),
        prism('b', square(100, 2), { group: 1, operation: MaskOperation.Exclude, opacity: 0 }),
      ],
      0,
    );

    const insideA = evaluatePackedMask(packed, new Vector3(5, 5, 3));
    expect(insideA.inside).toBe(true);
    expect(insideA.opacity).toBeGreaterThan(0);
  });

  it('takes the more visible opacity where two masks both keep a point', () => {
    const packed = packMaskRegions(
      [
        prism('dim', square(0, 10), { group: 0, opacity: 0.3 }),
        prism('bright', square(0, 10), { group: 1, opacity: 1 }),
      ],
      0,
    );
    expect(evaluatePackedMask(packed, new Vector3(5, 5, 0)).opacity).toBe(1);
  });

  it('lets a later outline of the same mask take back what an earlier one kept', () => {
    const packed = packMaskRegions(
      [
        prism('keep', square(0, 10), { group: 0 }),
        prism('carve', square(2, 3), { group: 0, operation: MaskOperation.Exclude }),
      ],
      0,
    );
    expect(evaluatePackedMask(packed, new Vector3(3, 1.5, 0)).inside).toBe(false);
    expect(evaluatePackedMask(packed, new Vector3(8, 8, 0)).inside).toBe(true);
  });

  it('seeds a mask from everything when its first outline is an exclude', () => {
    const packed = packMaskRegions(
      [prism('hide', square(0, 10), { group: 0, operation: MaskOperation.Exclude })],
      0,
    );
    expect(evaluatePackedMask(packed, new Vector3(5, 5, 0)).inside).toBe(false);
    expect(evaluatePackedMask(packed, new Vector3(500, 500, 0)).inside).toBe(true);
  });

  it('takes the outside default where no mask keeps the point', () => {
    const packed = packMaskRegions([prism('a', square(0, 10), { group: 0 })], 0.25);
    const outside = evaluatePackedMask(packed, new Vector3(500, 500, 0));
    expect(outside.inside).toBe(false);
    expect(outside.opacity).toBe(0.25);
  });

  it('agrees with the TypeScript evaluation on every fixture case', () => {
    for (const testCase of CONTAINMENT_CASES) {
      const packed = packMaskRegions([testCase.region], 0);
      const prepared = packed.regions;
      for (const point of [...testCase.inside, ...testCase.outside]) {
        expect(
          evaluatePackedMask(packed, point).inside,
          `${testCase.name} at ${point.toArray().join(', ')}`,
        ).toBe(isInsideMask(point, prepared));
      }
    }
  });
});
