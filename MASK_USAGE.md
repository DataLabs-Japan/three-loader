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

### MaskRegion

Each mask region defines:

- **modelMatrix**: Transformation matrix for the mask bounding box
- **min/max**: Bounding box bounds in local space (Vector3)
- **opacity**: Opacity for points INSIDE this region (0 = invisible, 1 = fully visible)

### MaskConfig

Configuration object containing:

- **regions**: Array of mask regions
- **defaultOpacity**: Opacity for points NOT inside any mask region

## Usage Examples

### Example 1: Everything Visible (No Masking Effect)

Both `defaultOpacity` and `region.opacity` are 1.0, so everything is visible regardless of masks.

```typescript
import { Potree } from 'three-loader';
import { Matrix4, Vector3 } from 'three';

const potree = new Potree();

// No masking effect - everything is visible
potree.setMaskRegions({
  regions: [
    {
      modelMatrix: new Matrix4(),
      min: new Vector3(-10, -10, 0),
      max: new Vector3(10, 10, 20),
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
potree.setMaskRegions({
  regions: [
    {
      modelMatrix: new Matrix4(),
      min: new Vector3(-10, -10, 0),
      max: new Vector3(10, 10, 20),
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
potree.setMaskRegions({
  regions: [
    {
      modelMatrix: new Matrix4(),
      min: new Vector3(-5, -5, 0),
      max: new Vector3(5, 5, 10),
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
potree.setMaskRegions({
  regions: [
    {
      // Region A - dim visibility
      modelMatrix: new Matrix4(),
      min: new Vector3(-10, -10, 0),
      max: new Vector3(10, 10, 20),
      opacity: 0.3, // Points INSIDE region A have 0.3 opacity
    },
    {
      // Region B - overlaps with A, full visibility
      modelMatrix: new Matrix4().makeTranslation(5, 5, 5),
      min: new Vector3(-8, -8, 0),
      max: new Vector3(8, 8, 15),
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
potree.clearMaskRegions();

// Or explicitly set to no masks
potree.setMaskRegions({
  regions: [],
  defaultOpacity: 1.0,
});
```

### Getting Current Mask Configuration

```typescript
const currentMasks = potree.getMaskConfig();
console.log(`Active masks: ${currentMasks.regions.length}`);
console.log(`Default opacity: ${currentMasks.defaultOpacity}`);
```

## How It Works

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

1. Transform point to each mask's local space
2. Apply the opacity calculation logic
3. Render with the calculated opacity

This two-level approach:

- **CPU**: Fast bounding box intersection test to cull entire invisible nodes (saves bandwidth)
- **GPU**: Precise per-point opacity calculation for loaded nodes (pixel-perfect masking)
