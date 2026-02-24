# Mask-Based Node Loading and Visibility

This document explains how to use the mask system in Potree to control point cloud visibility and optimize loading based on spatial regions. The mask system allows you to define regions in space where points can be shown or hidden by setting opacity values. This can be used for various effects such as showing only points inside a region, hiding points inside a region, or creating complex overlapping masks.

## Overview

The mask system allows you to:

- **Control visibility**: Show/hide points based on spatial regions using opacity
- **Optimize loading**: Skip loading nodes that are invisible based on mask regions
- **Handle overlapping masks**: Maximum opacity wins when masks overlap
- **Flexible masking**: Show inside, outside, or mixed regions—all controlled by opacity values

## Key Concepts

### Opacity-Based Visibility

Everything is controlled by opacity values (0 = invisible, 1 = fully visible):

- **defaultOpacity**: Opacity for points NOT inside any mask region
- **region.opacity**: Opacity for points INSIDE that mask region
- When masks overlap, the **maximum opacity** wins

### Common Patterns

| Pattern                    | defaultOpacity | region.opacity | Result                                    |
| -------------------------- | -------------- | -------------- | ----------------------------------------- |
| Show inside only           | 0.0            | 1.0            | Only points inside the region are visible |
| Hide inside (show outside) | 1.0            | 0.0            | Points inside the region are hidden       |
| Highlight region           | 1.0            | 1.0            | Everything visible (no effect)            |
| Dim outside                | 0.2            | 1.0            | Region is bright, outside is dimmed       |

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

### MaskConfig

Configuration object containing:

- **cuboids**: Array of cuboid mask regions
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
  cuboids: [
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
  cuboids: [
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
  cuboids: [
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

### Example 4: Overlapping Masks (Maximum Opacity Wins)

When masks overlap, points in the overlapping region get the **maximum opacity** from all overlapping masks.

```typescript
// Two overlapping regions with different opacities
potree.setMaskConfig({
  cuboids: [
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
// - Points in BOTH A and B (overlap): opacity = max(0.3, 1.0) = 1.0
// - Points outside both: opacity = 0.0
```

### Clearing Masks

```typescript
// Remove all masks and restore normal visibility
potree.clearMaskConfig(scene);

// Or explicitly set to no masks
potree.setMaskConfig({
  cuboids: [],
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

For each individual point (more precise than node-level):

1. **Transform to cuboid space**: Point in world coordinates is transformed relative to the cuboid's center and axes
2. **Bounds check**: Check if the transformed point is inside the cuboid's half-extents using the oriented axes
3. **Calculate opacity**:
   - If inside: `opacity = max(currentOpacity, cuboid.opacity)`
   - If outside: keep current opacity
4. **Render**: Use final opacity value

This two-level approach:

- **CPU**: Fast AABB intersection test to cull entire invisible nodes (saves bandwidth)
- **GPU**: Precise per-point OBB containment check for loaded nodes (pixel-perfect masking)

## Migration from dl.0.5 to dl.0.6

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

// -- New way (dl.0.6):
potree.setMaskConfig({ ... });

// No need to change transparency settings manually; the system will toggle it automatically.
```

**Note:** The old material-based approach is deprecated but still works for backward compatibility. However, as it masks points at the shader level, invisible nodes are still loaded and processed, incurring unnecessary network and GPU overhead. The new `setMaskConfig` method provides better performance by filtering out invisible nodes at the CPU level before loading, reducing both network transfer and shader processing costs.
