# Mask-Based Node Loading and Visibility

This document explains how to use the mask system in Potree to control point cloud visibility and optimize loading based on spatial regions. The mask system allows you to define regions in space where points can be shown or hidden by setting opacity values. This can be used for various effects such as showing only points inside a region, hiding points inside a region, or creating complex overlapping masks.

## Overview

The mask system allows you to:

- **Control visibility**: Show/hide points based on spatial regions using opacity
- **Two region shapes**: an oriented **box**, or a **polygon prism** — a closed coplanar outline extruded infinitely both ways along its plane normal
- **Optimize loading**: Skip loading nodes that are invisible based on mask regions
- **Order overlapping regions**: regions paint in list order and the last one over a point wins, so an outline can carve a hole and a later outline can put part of it back
- **Share the mask with other renderers**: the packed texture, the GLSL chunk and the containment test are all exported, so anything else in the scene masks to exactly the same edge

## Key Concepts

### Opacity-Based Visibility

Everything is controlled by opacity values (0 = invisible, 1 = fully visible):

- **defaultOpacity**: Opacity for points NOT inside any mask region
- **region.opacity**: Opacity for points INSIDE that mask region
- When regions overlap, the **last region in the list** wins

### Common Patterns

| Pattern                    | defaultOpacity | region.opacity | Result                                    |
| -------------------------- | -------------- | -------------- | ----------------------------------------- |
| Show inside only           | 0.0            | 1.0            | Only points inside the region are visible |
| Hide inside (show outside) | 1.0            | 0.0            | Points inside the region are hidden       |
| Highlight region           | 1.0            | 1.0            | Everything visible (no effect)            |
| Dim outside                | 0.2            | 1.0            | Region is bright, outside is dimmed       |

### Include and exclude

A region also carries an **operation**:

- `include` (the default) — points inside take the region's opacity.
- `exclude` — points inside fall back to `defaultOpacity`, as if no region covered them.

Because the last matching region wins, `exclude` is how a hole is carved out of an earlier region, and a further `include` over part of that hole puts it back.

**The first operation seeds the mask.** A leading `include` starts from nothing and grows it — *keep only what I outlined*. A leading `exclude` starts from everything and shrinks it — *hide what I outlined*, with everything else kept. Both are legitimate, and the difference is only visible if the seed is implemented: seeding empty either way renders a mask that opens with an `exclude` as an empty scene.

```typescript
// "Keep only this wall."
regions: [{ id: 'wall', kind: MaskRegionKind.Prism, positions: wall, opacity: 1 }]

// "Hide this parked van." Everything except the van stays.
regions: [
  { id: 'van', kind: MaskRegionKind.Prism, positions: van, operation: MaskOperation.Exclude, opacity: 1 },
]
```

### Groups: several independent masks at once

Regions sharing a **group** are one mask, ordered among themselves. Separate groups are **unioned**, so an `exclude` in one mask can never erase what another mask kept.

```typescript
potree.setMaskConfig({
  regions: [
    { id: 'a-keep',   group: 0, kind: MaskRegionKind.Prism, positions: a,     opacity: 1 },
    { id: 'a-hole',   group: 0, kind: MaskRegionKind.Prism, positions: aHole, operation: MaskOperation.Exclude, opacity: 1 },
    // A separate mask. Its own outlines are ordered among themselves; the hole above does not
    // reach into it, and it does not reach into the mask above.
    { id: 'b-keep',   group: 1, kind: MaskRegionKind.Prism, positions: b,     opacity: 1 },
  ],
  defaultOpacity: 0,
});
```

`group` defaults to the region's own index, which makes every region its own mask — the right default when each one is a separately-saved region. **Regions of a group must be given contiguously.**

### Cuboid

Each cuboid mask region defines:

- **id**: Unique identifier for the region (string)
- **center**: Center position of the cuboid in world space (Vector3)
- **rotation**: 3x3 rotation matrix as a 9-element array in column-major order `[m11, m12, m13, m21, m22, m23, m31, m32, m33]`. Defines the orientation of the cuboid axes.
- **extent**: Total size of the cuboid (Vector3). The half-extents are computed as `extent / 2`.
- **opacity**: Opacity for points INSIDE this region (0 = invisible, 1 = fully visible)

```typescript
// Example: Identity rotation (axis-aligned cuboid)
const rotation = [1, 0, 0, 0, 1, 0, 0, 0, 1];

// Example: Rotated cuboid (45° around Z axis)
const angle = Math.PI / 4;
const cos = Math.cos(angle);
const sin = Math.sin(angle);
const rotation = [
  cos,
  sin,
  0, // X axis in world space
  -sin,
  cos,
  0, // Y axis in world space
  0,
  0,
  1, // Z axis in world space
];
```

### Polygon prism

A prism is a closed coplanar outline extruded infinitely both ways along its plane normal. It has no depth and no caps: only a point's in-plane position decides whether it is inside, at every distance in front of and behind the plane the outline was drawn on.

- **id**: Unique identifier for the region (string)
- **kind**: `MaskRegionKind.Prism`
- **positions**: The outline's world-space vertices as an **open** ring — never repeat the first vertex at the end; the closing edge runs from the last vertex back to the first
- **operation**: `MaskOperation.Include` (default) or `MaskOperation.Exclude`
- **opacity**: Opacity for points INSIDE this region

Limits: up to 100 vertices per prism and 2800 across a whole mask. Regions past those caps, or whose outline is degenerate (fewer than 3 vertices, or all-collinear), are **dropped** rather than truncated — a truncated outline is a different shape, and masking by a different shape is worse than masking by one region fewer.

```typescript
import { MaskOperation, MaskRegionKind, Potree } from 'three-loader';

potree.setMaskConfig({
  regions: [
    {
      id: 'wall',
      kind: MaskRegionKind.Prism,
      positions: [
        new Vector3(0, 0, 2),
        new Vector3(4, 0, 2),
        new Vector3(4, 4, 2),
        new Vector3(0, 4, 2),
      ],
      opacity: 1.0,
    },
    {
      // Carve a hole out of the region above — later regions paint over earlier ones.
      id: 'hole',
      kind: MaskRegionKind.Prism,
      positions: holeOutline,
      operation: MaskOperation.Exclude,
      opacity: 1.0,
    },
  ],
  defaultOpacity: 0.0,
});
```

### MaskConfig

Configuration object containing:

- **regions**: Array of mask regions — boxes and prisms together, **in order**
- **defaultOpacity**: Opacity for points NOT inside any mask region

## Usage Examples

### Example 1: Everything Visible (No Masking Effect)

Both `defaultOpacity` and `region.opacity` are 1.0, so everything is visible regardless of masks.

```typescript
import { Potree } from 'three-loader';
import { Vector3 } from 'three';

const potree = new Potree();

// No masking effect - everything is visible
potree.setMaskConfig({
  regions: [
    {
      id: 'region-1',
      center: new Vector3(0, 0, 10),
      rotation: [1, 0, 0, 0, 1, 0, 0, 0, 1], // Identity rotation (axis-aligned)
      extent: new Vector3(20, 20, 20), // Total size of the region
      opacity: 1.0, // Points INSIDE are fully visible
    },
  ],
  defaultOpacity: 1.0, // Points OUTSIDE are also fully visible
});

// In your render loop
potree.updatePointClouds(pointClouds, camera, renderer);
```

### Example 2: Show Inside Only

`defaultOpacity` is 0.0 and `region.opacity` is non-zero (1.0), so only points inside the region are visible.

```typescript
// Show only points inside the box
potree.setMaskConfig({
  regions: [
    {
      id: 'show-region',
      center: new Vector3(0, 0, 10),
      rotation: [1, 0, 0, 0, 1, 0, 0, 0, 1], // Identity rotation
      extent: new Vector3(20, 20, 20), // Total size: 20x20x20
      opacity: 1.0, // Points INSIDE are visible
    },
  ],
  defaultOpacity: 0.0, // Points OUTSIDE are hidden
});
```

### Example 3: Show Outside Only (Hide Inside)

`defaultOpacity` is 1.0 and `region.opacity` is 0.0, so points inside the region are hidden.

```typescript
// Hide points inside a region (e.g., remove a building)
potree.setMaskConfig({
  regions: [
    {
      id: 'hide-region',
      center: new Vector3(0, 0, 5),
      rotation: [1, 0, 0, 0, 1, 0, 0, 0, 1], // Identity rotation
      extent: new Vector3(10, 10, 10), // Total size: 10x10x10
      opacity: 0.0, // Points INSIDE are hidden
    },
  ],
  defaultOpacity: 1.0, // Points OUTSIDE are visible
});
```

### Example 4: Overlapping Masks (The Last Region Wins)

When regions overlap, points in the overlap take the opacity of the **last** region in the list that contains them.

```typescript
// Two overlapping regions with different opacities
potree.setMaskConfig({
  regions: [
    {
      // Region A - dim visibility
      id: 'region-a',
      center: new Vector3(0, 0, 10),
      rotation: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      extent: new Vector3(20, 20, 20),
      opacity: 0.3, // Points INSIDE region A have 0.3 opacity
    },
    {
      // Region B - overlaps with A, full visibility
      id: 'region-b',
      center: new Vector3(5, 5, 5), // Translated position in world space
      rotation: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      extent: new Vector3(16, 16, 15),
      opacity: 1.0, // Points INSIDE region B have 1.0 opacity
    },
  ],
  defaultOpacity: 0.0, // Points OUTSIDE all regions are hidden
});

// Result:
// - Points only in region A: opacity = 0.3
// - Points only in region B: opacity = 1.0
// - Points in BOTH A and B (overlap): opacity = 1.0 — B is later in the list
// - Points outside both: opacity = 0.0
```

### Clearing Masks

```typescript
// Remove all masks and restore normal visibility
potree.clearMaskConfig(scene);

// Or explicitly set to no masks
potree.setMaskConfig({
  regions: [],
  defaultOpacity: 1.0,
});
```

## How It Works

### Cuboid Transformation

Each cuboid is defined by:

- **center**: Position in world space
- **rotation**: 3x3 rotation matrix defining the orientation of the cuboid's local axes
- **extent**: Total size of the cuboid (half-extents are computed internally)

Internally, the system computes:

- **Axis vectors** (axisX, axisY, axisZ) from the rotation matrix
- **Bounding box** (bbox) in world space for quick intersection testing

The cuboid uses oriented bounding box (OBB) math:

- **CPU-level culling**: Uses the world-space AABB that bounds the OBB for fast intersection tests
- **GPU shader**: Uses the OBB axes and half-extents for precise per-point containment checks

### Node Visibility Determination (CPU-level culling)

For each octree node:

1. **Check intersection:**

   - If node's bounding box **intersects** with any mask region that has `opacity > 0`:
     - Node is marked as potentially visible and will be loaded
   - If node doesn't intersect any mask region:
     - Node is loaded only if `defaultOpacity > 0`

2. **Conservative approach:**
   - Simple bounding box intersection test (fast)
   - Some nodes may load even if most of their points are invisible
   - GPU shader provides precise per-point opacity filtering

### Point Opacity Calculation (GPU-level shader)

Every region — boxes and prisms alike — is packed into a single **data texture** that the fragment shader samples. For each point:

1. **Walk the regions in order** and test containment:
   - Box: transform the world position into the box's local space and compare against its half-extents.
   - Prism: project the world position into the prism's fitted plane basis with two dot products, reject against the outline's 2D bounding box, then run an even-odd crossing test over the flattened outline.
2. **Seed, then last match wins**: the mask's first operation seeds every point (`include` → kept by nothing, `exclude` → kept by everything), then each region containing it assigns — `include` sets the opacity to its own, `exclude` drops back to `defaultOpacity`.
3. **Render**: use the final opacity, discarding the fragment when it is 0.

The picker renders through the same material, so a point the shader discards cannot be picked either.

**No recompiles.** The region count, every region's geometry and the outside-everything default all live inside the texture, so changing the mask is one buffer rewrite and one upload. A lasso mask that changes on every click costs nothing but that. The only shader recompile is the first time masking is used at all.

**The prism's in-plane bounds do the rejecting.** A prism is unbounded along its normal, so it has no finite world AABB to reject against; the outline's 2D box is exact and does the same job. That rejection is required, not an optimisation: at the vertex cap an unfiltered outline is 100 edge tests per fragment.

## Masking something other than the point cloud

A project that renders a mesh (or anything else) beside the point cloud has to mask it to the identical edge. Rather than rebuilding the packing and hoping the two agree, reuse these exports:

```typescript
import {
  MASK_GLSL_CHUNK,
  MASK_CHUNK_TOKEN,
  isInsideMaskRegion,
  packMaskRegions,
  createMaskDataTexture,
  writeMaskDataTexture,
} from 'three-loader';

// 1. The texture Potree already packed — bind it, don't rebuild it.
material.uniforms.uMaskRegionTex = { value: potree.maskDataTexture };

// 2. The containment test and the ordering loop, injected verbatim.
material.onBeforeCompile = (shader) => {
  shader.uniforms.uMaskRegionTex = { value: potree.maskDataTexture };
  shader.fragmentShader = shader.fragmentShader
    .replace('void main() {', `${MASK_GLSL_CHUNK}\nvoid main() {`)
    .replace('#include <dithering_fragment>', `
      bool insideMask = false;
      float maskOpacity = maskEvaluate(vWorldPosition, insideMask);
      if (maskOpacity <= 0.0) discard;
    `);
};
```

`maskEvaluate(worldPos, out inside)` reports the opacity and whether the point fell inside a region; what the shader does with that — discard, dim, tint — is the caller's business.

With no point cloud in the scene, pack the regions yourself:

```typescript
const packed = packMaskRegions(regions, defaultOpacity);
const texture = createMaskDataTexture(packed);
// …later, when the mask changes:
writeMaskDataTexture(texture, packMaskRegions(nextRegions, defaultOpacity));
```

And for the same answer without a GPU — picking, draw-time validation — use the TypeScript containment test on a prepared region:

`isInsideMaskRegion` answers for one region; `isInsideMaskGroup` answers for a whole mask, applying the ordering and the seeding rule exactly as the shader does — use that one unless you really mean a single region.

```typescript
const prepared = regions.map(prepareMaskRegion).filter((region) => region !== null);
if (isInsideMaskGroup(point, prepared)) { /* … */ }
```

The GLSL and TypeScript containment tests are the one unavoidable duplicate, so they are pinned to a shared fixture (`src/mask/__tests__/containment.fixture.ts`) asserted in CI.

**Layout constants are exported too** (`MASK_TEXTURE_WIDTH`, `MASK_HEADER_TEXELS`, `MASK_MAX_REGIONS`, …). Read them; never hard-code a texel offset.

## Migration to the ordered `regions` API

`setMaskConfig` takes `regions` in place of `cuboids`. A box region is unchanged apart from living in the new array:

```typescript
// -- Before:
potree.setMaskConfig({ cuboids: boxes, defaultOpacity: 0 });

// -- After:
potree.setMaskConfig({ regions: boxes, defaultOpacity: 0 });
```

The order of `regions` is significant where it never was for `cuboids` — with boxes alone and a single opacity, the two give the same result.

## Migration from dl.0.5 to >=dl.0.6

You no longer need to set the regions directly on the material. Simply call `setMaskConfig` on the Potree instance and it will automatically update the materials of all point clouds.

```typescript
// -- Old way (dl.0.5):
pointCloud.material.maskRegionLength = maskRegionUniforms.length
pointCloud.material.opacityOutOfMasks = 0
pointCloud.material.maskRegions = maskRegionUniforms

if (pcdTransparency !== undefined && pcdTransparency < 1) {
  pointCloud.material.enableTransparency()
  pointCloud.material.blending = NormalBlending
} else {
  pointCloud.material.disableTransparency()
}

// -- New way (>=dl.0.6):
// If the pointcloud have transparency, enable it manually.
pointClouds.forEach((pointCloud) => {
  pointCloud.material.opacity = defaultOpacity
  pointCloud.material.enableTransparency()
  pointCloud.material.blending = NormalBlending
})

potree.setMaskConfig({ ... });
```

**Note:** The old material-based approach is deprecated but still works for backward compatibility. However, as it masks points at the shader level, invisible nodes are still loaded and processed, incurring unnecessary network and GPU overhead. The new `setMaskConfig` method provides better performance by filtering out invisible nodes at the CPU level before loading, reducing both network transfer and shader processing costs.
