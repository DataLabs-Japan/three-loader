import {
  Box3,
  Camera,
  Frustum,
  Matrix4,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Ray,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

import {
  DEFAULT_POINT_BUDGET,
  MAX_LOADS_TO_GPU,
  MAX_NUM_NODES_LOADING,
  PERSPECTIVE_CAMERA,
} from './constants';
import { FEATURES } from './features';
import { BinaryLoader, GetUrlFn, loadPOC } from './loading';
import { loadOctree } from './loading2/load-octree';
import { ClipMode } from './materials';
import { PointCloudOctree } from './point-cloud-octree';
import { PointCloudOctreeNode } from './point-cloud-octree-node';
import { PickParams, PointCloudOctreePicker } from './point-cloud-octree-picker';
import { isGeometryNode, isTreeNode } from './type-predicates';
import {
  IPointCloudGeometryNode,
  IPointCloudTreeNode,
  IPotree,
  IVisibilityUpdateResult,
  MaskConfig,
  PCOGeometry,
  PickPoint,
} from './types';
import { BinaryHeap } from './utils/binary-heap';
import { addBox3Helper, addOrientedBox3Helper, Box3Helper } from './utils/box3-helper';
import { LRU } from './utils/lru';

export class QueueItem {
  constructor(
    public pointCloudIndex: number,
    public weight: number,
    public node: IPointCloudTreeNode,
    public parent?: IPointCloudTreeNode | null,
  ) {}
}

type GeometryLoader = (
  url: string,
  getUrl: GetUrlFn,
  xhrRequest: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
) => Promise<PCOGeometry>;

const GEOMETRY_LOADERS: Record<string, GeometryLoader> = {
  v1: loadPOC,
  v2: loadOctree,
};

export type PotreeVersion = keyof typeof GEOMETRY_LOADERS;

export class Potree implements IPotree {
  private static picker: PointCloudOctreePicker | undefined;
  private _pointBudget: number = DEFAULT_POINT_BUDGET;
  private _rendererSize: Vector2 = new Vector2();

  maxNumNodesLoading: number = MAX_NUM_NODES_LOADING;
  features = FEATURES;
  lru = new LRU(this._pointBudget);

  private readonly loadGeometry: GeometryLoader;
  private maskConfig: MaskConfig = {
    regions: [],
    defaultOpacity: 1.0,
  };

  constructor(version: PotreeVersion = 'v1') {
    this.loadGeometry = GEOMETRY_LOADERS[version];
  }

  /**
   * Load a point cloud from a given URL. The URL is the location of the potree metadata (e.g. `metadata.json`).
   * The `getUrl` function is used to resolve the URLs of the geometry files, which allows for
   * custom logic such as signing URLs or fetching from different sources.
   *
   * @param url The URL of the point cloud metadata file.
   * @param getUrl A function to resolve the URLs of the geometry files.
   * @param xhrRequest Optional function to perform the XHR request. Defaults to `fetch`.
   * @returns A promise that resolves to the loaded `PointCloudOctree`.
   */
  loadPointCloud(
    url: string,
    getUrl: GetUrlFn,
    xhrRequest = (input: RequestInfo, init?: RequestInit) => fetch(input, init),
  ): Promise<PointCloudOctree> {
    return this.loadGeometry(url, getUrl, xhrRequest).then(
      geometry => new PointCloudOctree(this, geometry),
    );
  }

  /**
   * Set mask regions for visibility filtering and opacity control.
   *
   * @param config Mask configuration with regions and default opacity
   * @param scene Optional Three.js scene to add debug helpers for mask regions. If not provided, no helpers will be added.
   *
   * @example
   * ```typescript
   * // Show only inside a region (defaultOpacity=0, region.opacity=1)
   * potree.setMaskConfig({
   *   regions: [
   *     {
   *       modelMatrix: new Matrix4(),
   *       min: new Vector3(-10, -10, 0),
   *       max: new Vector3(10, 10, 20),
   *       opacity: 1.0, // Visible inside
   *     }
   *   ],
   *   defaultOpacity: 0.0 // Hidden outside
   * });
   *
   * // Hide inside a region (defaultOpacity=1, region.opacity=0)
   * potree.setMaskConfig({
   *   regions: [
   *     {
   *       modelMatrix: new Matrix4(),
   *       min: new Vector3(-5, -5, 0),
   *       max: new Vector3(5, 5, 10),
   *       opacity: 0.0, // Hidden inside
   *     }
   *   ],
   *   defaultOpacity: 1.0 // Visible outside
   * });
   * ```
   */
  setMaskConfig(config: MaskConfig, scene?: Object3D): void {
    this.maskConfig = {
      regions: config.regions || [],
      defaultOpacity: config.defaultOpacity ?? 1.0,
    };

    // Optionally add debug helpers to visualize mask regions in the scene
    if (scene) {
      for (const region of this.maskConfig.regions) {
        const obb = new Box3(region.min.clone(), region.max.clone());
        const aabb = obb.clone().applyMatrix4(region.modelMatrix.clone().invert());

        scene.add(addBox3Helper(scene, `mask-region-helper-aabb-${region.id}`, aabb, 0x00ff00));
        scene.add(
          addOrientedBox3Helper(
            scene,
            `mask-region-helper-obb-${region.id}`,
            obb,
            region.modelMatrix.clone().invert(),
            0xff0000,
          ),
        );
      }
    }
  }

  /**
   * Clear all mask regions and restore default visibility
   */
  clearMaskConfig(): void {
    this.setMaskConfig({
      regions: [],
      defaultOpacity: 1.0,
    });
  }

  /**
   * Get current mask configuration
   */
  getMaskConfig(): MaskConfig {
    return { ...this.maskConfig };
  }

  /**
   * Check if a node is masked out based on the current mask configuration.
   * A node is considered masked out if it should be hidden according to the mask regions and their opacities.
   */
  private isNodeMaskedOut(pointCloud: PointCloudOctree, node: PointCloudOctreeNode): boolean {
    if (this.maskConfig.regions.length > 0) {
      const nodeBBox = node.boundingBox;

      // For each mask region, check if the node's bounding box intersects with the mask's bounding box
      for (const mask of this.maskConfig.regions) {
        // Create a Box3 for the mask region in world space
        const maskBox = new Box3(mask.min.clone(), mask.max.clone()).applyMatrix4(
          mask.modelMatrix.clone().invert(),
        );
        const nodeBoxWorld = nodeBBox.clone().applyMatrix4(pointCloud.matrixWorld);

        // -- Check if node is masked out by this region
        // If the mask opacity is > 0, a simple intersection check is sufficient.
        // If the mask opacity is == 0, we only want to skip if the node is fully contained within the mask.
        if (mask.opacity > 0) {
          return !nodeBoxWorld.intersectsBox(maskBox);
        } else {
          return maskBox.containsBox(nodeBoxWorld);
        }
      }
    }

    // If no masks or node doesn't intersect any mask, use default opacity to determine visibility
    return this.maskConfig.defaultOpacity > 0;
  }

  /**
   * Update the visibility of nodes in all loaded point clouds based on the camera view and point budget.
   * This method should be called on each frame before rendering to ensure that the correct nodes are visible.
   *
   * @param pointClouds An array of `PointCloudOctree` instances to update.
   * @param camera The camera used for rendering the scene. This is used to determine which nodes are in view.
   * @param renderer The WebGLRenderer instance, used to get the current viewport size for LOD calculations.
   * @returns An object containing information about visible nodes, number of visible points, and loading status.
   */
  updatePointClouds(
    pointClouds: PointCloudOctree[],
    camera: Camera,
    renderer: WebGLRenderer,
  ): IVisibilityUpdateResult {
    const result = this.updateVisibility(pointClouds, camera, renderer);

    for (let i = 0; i < pointClouds.length; i++) {
      const pointCloud = pointClouds[i];
      if (pointCloud.disposed) {
        continue;
      }

      pointCloud.material.updateMaterial(pointCloud, pointCloud.visibleNodes, camera, renderer);
      pointCloud.updateVisibleBounds();
      pointCloud.updateBoundingBoxes();
    }

    this.lru.freeMemory();

    return result;
  }

  static pick(
    pointClouds: PointCloudOctree[],
    renderer: WebGLRenderer,
    camera: Camera,
    ray: Ray,
    params: Partial<PickParams> = {},
  ): PickPoint | null {
    Potree.picker = Potree.picker || new PointCloudOctreePicker();
    return Potree.picker.pick(renderer, camera, ray, pointClouds, params);
  }

  get pointBudget(): number {
    return this._pointBudget;
  }

  set pointBudget(value: number) {
    if (value !== this._pointBudget) {
      this._pointBudget = value;
      this.lru.pointBudget = value;
      this.lru.freeMemory();
    }
  }

  static set maxLoaderWorkers(value: number) {
    BinaryLoader.WORKER_POOL.maxWorkers = value;
  }

  static get maxLoaderWorkers(): number {
    return BinaryLoader.WORKER_POOL.maxWorkers;
  }

  private updateVisibility(
    pointClouds: PointCloudOctree[],
    camera: Camera,
    renderer: WebGLRenderer,
  ): IVisibilityUpdateResult {
    let numVisiblePoints = 0;

    const visibleNodes: PointCloudOctreeNode[] = [];
    const unloadedGeometry: IPointCloudGeometryNode[] = [];

    // calculate object space frustum and cam pos and setup priority queue
    const { frustums, cameraPositions, priorityQueue } = this.updateVisibilityStructures(
      pointClouds,
      camera,
    );

    let loadedToGPUThisFrame = 0;
    let exceededMaxLoadsToGPU = false;
    let nodeLoadFailed = false;
    let queueItem: QueueItem | undefined;

    while ((queueItem = priorityQueue.pop()) !== undefined) {
      let node = queueItem.node;

      // If we will end up with too many points, we stop right away.
      if (numVisiblePoints + node.numPoints > this.pointBudget) {
        break;
      }

      const pointCloudIndex = queueItem.pointCloudIndex;
      const pointCloud = pointClouds[pointCloudIndex];

      const maxLevel = pointCloud.maxLevel !== undefined ? pointCloud.maxLevel : Infinity;

      if (
        node.level > maxLevel ||
        !frustums[pointCloudIndex].intersectsBox(node.boundingBox) ||
        this.shouldClip(pointCloud, node.boundingBox)
      ) {
        continue;
      }

      if (isTreeNode(node) && this.isNodeMaskedOut(pointCloud, node)) {
        continue;
      }

      numVisiblePoints += node.numPoints;
      pointCloud.numVisiblePoints += node.numPoints;

      const parentNode = queueItem.parent;

      if (isGeometryNode(node) && (!parentNode || isTreeNode(parentNode))) {
        if (node.loaded && loadedToGPUThisFrame < MAX_LOADS_TO_GPU) {
          node = pointCloud.toTreeNode(node, parentNode);
          loadedToGPUThisFrame++;
        } else if (!node.failed) {
          if (node.loaded && loadedToGPUThisFrame >= MAX_LOADS_TO_GPU) {
            exceededMaxLoadsToGPU = true;
          }
          unloadedGeometry.push(node);
          pointCloud.visibleGeometry.push(node);
        } else {
          nodeLoadFailed = true;
          continue;
        }
      }

      if (isTreeNode(node)) {
        this.updateTreeNodeVisibility(pointCloud, node, visibleNodes);
        pointCloud.visibleGeometry.push(node.geometryNode);
      }

      const halfHeight =
        0.5 * renderer.getSize(this._rendererSize).height * renderer.getPixelRatio();

      this.updateChildVisibility(
        queueItem,
        priorityQueue,
        pointCloud,
        node,
        cameraPositions[pointCloudIndex],
        camera,
        halfHeight,
      );
    } // end priority queue loop

    const numNodesToLoad = Math.min(this.maxNumNodesLoading, unloadedGeometry.length);
    const nodeLoadPromises: Promise<void>[] = [];
    for (let i = 0; i < numNodesToLoad; i++) {
      nodeLoadPromises.push(unloadedGeometry[i].load());
    }

    return {
      visibleNodes: visibleNodes,
      numVisiblePoints: numVisiblePoints,
      exceededMaxLoadsToGPU: exceededMaxLoadsToGPU,
      nodeLoadFailed: nodeLoadFailed,
      nodeLoadPromises: nodeLoadPromises,
    };
  }

  private updateTreeNodeVisibility(
    pointCloud: PointCloudOctree,
    node: PointCloudOctreeNode,
    visibleNodes: IPointCloudTreeNode[],
  ): void {
    this.lru.touch(node.geometryNode);

    const sceneNode = node.sceneNode;
    sceneNode.visible = true;
    sceneNode.material = pointCloud.material;
    sceneNode.updateMatrix();
    sceneNode.matrixWorld.multiplyMatrices(pointCloud.matrixWorld, sceneNode.matrix);

    visibleNodes.push(node);
    pointCloud.visibleNodes.push(node);

    this.updateBoundingBoxVisibility(pointCloud, node);
  }

  private updateChildVisibility(
    queueItem: QueueItem,
    priorityQueue: BinaryHeap<QueueItem>,
    pointCloud: PointCloudOctree,
    node: IPointCloudTreeNode,
    cameraPosition: Vector3,
    camera: Camera,
    halfHeight: number,
  ): void {
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child === null) {
        continue;
      }

      const sphere = child.boundingSphere;
      const distance = sphere.center.distanceTo(cameraPosition);
      const radius = sphere.radius;

      let projectionFactor = 0.0;

      if (camera.type === PERSPECTIVE_CAMERA) {
        const perspective = camera as PerspectiveCamera;
        const fov = (perspective.fov * Math.PI) / 180.0;
        const slope = Math.tan(fov / 2.0);
        projectionFactor = halfHeight / (slope * distance);
      } else {
        const orthographic = camera as OrthographicCamera;
        projectionFactor = (2 * halfHeight) / (orthographic.top - orthographic.bottom);
      }

      const screenPixelRadius = radius * projectionFactor;

      // Don't add the node if it'll be too small on the screen.
      if (screenPixelRadius < pointCloud.minNodePixelSize) {
        continue;
      }

      // Nodes which are larger will have priority in loading/displaying.
      const weight = distance < radius ? Number.MAX_VALUE : screenPixelRadius + 1 / distance;

      priorityQueue.push(new QueueItem(queueItem.pointCloudIndex, weight, child, node));
    }
  }

  private updateBoundingBoxVisibility(
    pointCloud: PointCloudOctree,
    node: PointCloudOctreeNode,
  ): void {
    if (pointCloud.showBoundingBox && !node.boundingBoxNode) {
      const boxHelper = new Box3Helper(node.boundingBox);
      boxHelper.matrixAutoUpdate = false;
      pointCloud.boundingBoxNodes.push(boxHelper);
      node.boundingBoxNode = boxHelper;
      node.boundingBoxNode.matrix.copy(pointCloud.matrixWorld);
    } else if (pointCloud.showBoundingBox && node.boundingBoxNode) {
      node.boundingBoxNode.visible = true;
      node.boundingBoxNode.matrix.copy(pointCloud.matrixWorld);
    } else if (!pointCloud.showBoundingBox && node.boundingBoxNode) {
      node.boundingBoxNode.visible = false;
    }
  }

  private shouldClip(pointCloud: PointCloudOctree, boundingBox: Box3): boolean {
    const material = pointCloud.material;

    if (material.numClipBoxes === 0 || material.clipMode !== ClipMode.CLIP_OUTSIDE) {
      return false;
    }

    const box2 = boundingBox.clone();
    pointCloud.updateMatrixWorld(true);
    box2.applyMatrix4(pointCloud.matrixWorld);

    const clipBoxes = material.clipBoxes;
    for (let i = 0; i < clipBoxes.length; i++) {
      const clipMatrixWorld = clipBoxes[i].matrix;
      const clipBoxWorld = new Box3(
        new Vector3(-0.5, -0.5, -0.5),
        new Vector3(0.5, 0.5, 0.5),
      ).applyMatrix4(clipMatrixWorld);
      if (box2.intersectsBox(clipBoxWorld)) {
        return false;
      }
    }

    return true;
  }

  private updateVisibilityStructures = (() => {
    const frustumMatrix = new Matrix4();
    const inverseWorldMatrix = new Matrix4();
    const cameraMatrix = new Matrix4();

    return (
      pointClouds: PointCloudOctree[],
      camera: Camera,
    ): {
      frustums: Frustum[];
      cameraPositions: Vector3[];
      priorityQueue: BinaryHeap<QueueItem>;
    } => {
      const frustums: Frustum[] = [];
      const cameraPositions: Vector3[] = [];
      const priorityQueue = new BinaryHeap<QueueItem>(x => 1 / x.weight);

      for (let i = 0; i < pointClouds.length; i++) {
        const pointCloud = pointClouds[i];

        if (!pointCloud.initialized()) {
          continue;
        }

        pointCloud.numVisiblePoints = 0;
        pointCloud.visibleNodes = [];
        pointCloud.visibleGeometry = [];

        camera.updateMatrixWorld(false);

        // Furstum in object space.
        const inverseViewMatrix = camera.matrixWorldInverse;
        const worldMatrix = pointCloud.matrixWorld;
        frustumMatrix
          .identity()
          .multiply(camera.projectionMatrix)
          .multiply(inverseViewMatrix)
          .multiply(worldMatrix);
        frustums.push(new Frustum().setFromProjectionMatrix(frustumMatrix));

        // Camera position in object space
        inverseWorldMatrix.copy(worldMatrix).invert();
        cameraMatrix
          .identity()
          .multiply(inverseWorldMatrix)
          .multiply(camera.matrixWorld);
        cameraPositions.push(new Vector3().setFromMatrixPosition(cameraMatrix));

        if (pointCloud.visible && pointCloud.root !== null) {
          const weight = Number.MAX_VALUE;
          priorityQueue.push(new QueueItem(i, weight, pointCloud.root));
        }

        // Hide any previously visible nodes. We will later show only the needed ones.
        if (isTreeNode(pointCloud.root)) {
          pointCloud.hideDescendants(pointCloud.root.sceneNode);
        }

        for (const boundingBoxNode of pointCloud.boundingBoxNodes) {
          boundingBoxNode.visible = false;
        }
      }

      return { frustums, cameraPositions, priorityQueue };
    };
  })();
}
