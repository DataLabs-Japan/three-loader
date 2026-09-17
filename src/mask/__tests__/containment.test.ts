import { Vector3 } from 'three';
import { describe, expect, it } from 'vitest';
import {
  MASK_FLAG_EXCLUDE,
  MASK_FLAG_PRISM,
  MASK_HEADER_TEXELS,
  MASK_PAYLOAD_OFFSET,
} from '../constants';
import {
  fitPrismBasis,
  isInsideMaskGroup,
  isInsideMaskRegion,
  prepareMaskRegion,
} from '../geometry';
import { packMaskRegions } from '../packing';
import { MaskOperation, MaskRegionKind } from '../types';
import { CONTAINMENT_CASES } from './containment.fixture';

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
    expect(grouped.data[(MASK_HEADER_TEXELS + 0) * 4 + 3]).toBe(7);
    expect(grouped.data[(MASK_HEADER_TEXELS + 1) * 4 + 3]).toBe(7);
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
