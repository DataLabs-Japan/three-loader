import { Box3, BufferGeometry, Camera, Matrix4, Sphere, Vector3, WebGLRenderer } from 'three';
import { GetUrlFn, XhrRequest } from './loading/types';
import { OctreeGeometry } from './loading2/octree-geometry';
import { PointCloudOctree } from './point-cloud-octree';
import { PointCloudOctreeGeometry } from './point-cloud-octree-geometry';
import { PreparedMaskRegion } from './mask/types';
import { LRU } from './utils/lru';

/**
 * A region of the deprecated `mask_region_length` material path (`material.maskRegions`), which
 * `hatsuly-app` still drives in production and which this library therefore keeps compiling.
 *
 * Renamed from `MaskRegion`, which now names the shape a mask is built from — see `./mask/types`.
 * The path itself is untouched.
 */
export interface MaskRegionUniform {
  /** Unique identifier for the mask region */
  id: string;
  /** Model matrix representing the orientation and position of the mask region */
  matrix: Matrix4;
  /** Inverse matrix from world space to local space for the mask region */
  inverseMatrix?: Matrix4;
  /** Minimum bounds in local space */
  min: Vector3;
  /** Maximum bounds in local space */
  max: Vector3;
  /** Opacity for points inside this mask region (0 = invisible, 1 = fully visible) */
  opacity: number;
  /** Bounding box in world space for quick culling */
  bbox?: Box3;
}

export interface InternalMaskConfig {
  /** The mask's regions, prepared and in order. */
  regions: PreparedMaskRegion[];
  /** Default opacity for points not inside any mask region */
  defaultOpacity: number;
  /** Flag to indicate if the mask config has changed and needs to be re-packed into the texture */
  needsUpdate: boolean;
}

export interface IPointCloudTreeNode {
  id: number;
  name: string;
  level: number;
  index: number;
  spacing: number;
  boundingBox: Box3;
  boundingSphere: Sphere;
  loaded: boolean;
  numPoints: number;
  readonly children: ReadonlyArray<IPointCloudTreeNode | null>;
  readonly isLeafNode: boolean;

  dispose(): void;

  traverse(cb: (node: IPointCloudTreeNode) => void, includeSelf?: boolean): void;
}

export interface IPointCloudGeometryNode extends IPointCloudTreeNode {
  geometry: BufferGeometry | undefined;
  oneTimeDisposeHandlers: Function[];

  loading: boolean;
  loaded: boolean;
  failed: boolean;

  load(): Promise<void>;
}

export interface IVisibilityUpdateResult {
  visibleNodes: IPointCloudTreeNode[];
  numVisiblePoints: number;
  /**
   * True when a node has been loaded but was not added to the scene yet.
   * Make sure to call updatePointClouds() again on the next frame.
   */
  exceededMaxLoadsToGPU: boolean;
  /**
   * True when at least one node in view has failed to load.
   */
  nodeLoadFailed: boolean;
  /**
   * Promises for loading nodes, will reject when loading fails.
   */
  nodeLoadPromises: Promise<void>[];
}

export interface IPotree {
  pointBudget: number;
  maxNumNodesLoading: number;
  lru: LRU;

  loadPointCloud(url: string, getUrl: GetUrlFn, xhrRequest?: XhrRequest): Promise<PointCloudOctree>;

  updatePointClouds(
    pointClouds: PointCloudOctree[],
    camera: Camera,
    renderer: WebGLRenderer,
  ): IVisibilityUpdateResult;
}

export interface PickPoint {
  position?: Vector3;
  normal?: Vector3;
  pointCloud?: PointCloudOctree;
  [property: string]: any;
}

export interface PointCloudHit {
  pIndex: number;
  pcIndex: number;
}

export type PCOGeometry = PointCloudOctreeGeometry | OctreeGeometry;
