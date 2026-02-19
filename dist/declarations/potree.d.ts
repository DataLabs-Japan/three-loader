import { Camera, Object3D, Ray, WebGLRenderer } from 'three';
import { GetUrlFn } from './loading';
import { PointCloudOctree } from './point-cloud-octree';
import { PickParams } from './point-cloud-octree-picker';
import { IPointCloudTreeNode, IPotree, IVisibilityUpdateResult, MaskConfig, PCOGeometry, PickPoint } from './types';
import { LRU } from './utils/lru';
export declare class QueueItem {
    pointCloudIndex: number;
    weight: number;
    node: IPointCloudTreeNode;
    parent?: IPointCloudTreeNode | null | undefined;
    constructor(pointCloudIndex: number, weight: number, node: IPointCloudTreeNode, parent?: IPointCloudTreeNode | null | undefined);
}
type GeometryLoader = (url: string, getUrl: GetUrlFn, xhrRequest: (input: RequestInfo, init?: RequestInit) => Promise<Response>) => Promise<PCOGeometry>;
declare const GEOMETRY_LOADERS: Record<string, GeometryLoader>;
export type PotreeVersion = keyof typeof GEOMETRY_LOADERS;
export declare class Potree implements IPotree {
    private static picker;
    private _pointBudget;
    private _rendererSize;
    maxNumNodesLoading: number;
    features: {
        SHADER_INTERPOLATION: boolean;
        SHADER_SPLATS: boolean;
        SHADER_EDL: boolean;
        precision: string;
    };
    lru: LRU;
    private readonly loadGeometry;
    private maskConfig;
    constructor(version?: PotreeVersion);
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
    loadPointCloud(url: string, getUrl: GetUrlFn, xhrRequest?: (input: RequestInfo, init?: RequestInit) => Promise<Response>): Promise<PointCloudOctree>;
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
     *       id: 'region-1',
     *       matrix: new Matrix4(),
     *       min: new Vector3(-10, -10, 0),
     *       max: new Vector3(10, 10, 20),
     *       opacity: 1.0, // Visible inside
     *     }
     *   ],
     *   defaultOpacity: 0.0 // Outside is hidden
     * });
     *
     * // Hide inside a region (defaultOpacity=1, region.opacity=0)
     * potree.setMaskConfig({
     *   regions: [
     *     {
     *       id: 'region-2',
     *       matrix: new Matrix4(),
     *       min: new Vector3(-5, -5, 0),
     *       max: new Vector3(5, 5, 10),
     *       opacity: 0.0, // Hidden inside
     *     }
     *   ],
     *   defaultOpacity: 1.0 // Outside is visible
     * });
     * ```
     */
    setMaskConfig(config: MaskConfig, scene?: Object3D): void;
    /**
     * Clear all mask regions and restore default visibility
     */
    clearMaskConfig(): void;
    /**
     * Get current mask configuration
     */
    getMaskConfig(): MaskConfig;
    /**
     * Check if a node is masked out based on the current mask configuration.
     * A node is considered masked out if it should be hidden according to the mask regions and their opacities.
     */
    private isNodeMaskedOut;
    /**
     * Update the visibility of nodes in all loaded point clouds based on the camera view and point budget.
     * This method should be called on each frame before rendering to ensure that the correct nodes are visible.
     *
     * @param pointClouds An array of `PointCloudOctree` instances to update.
     * @param camera The camera used for rendering the scene. This is used to determine which nodes are in view.
     * @param renderer The WebGLRenderer instance, used to get the current viewport size for LOD calculations.
     * @returns An object containing information about visible nodes, number of visible points, and loading status.
     */
    updatePointClouds(pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer): IVisibilityUpdateResult;
    static pick(pointClouds: PointCloudOctree[], renderer: WebGLRenderer, camera: Camera, ray: Ray, params?: Partial<PickParams>): PickPoint | null;
    get pointBudget(): number;
    set pointBudget(value: number);
    static set maxLoaderWorkers(value: number);
    static get maxLoaderWorkers(): number;
    private updateVisibility;
    private updateTreeNodeVisibility;
    private updateChildVisibility;
    private updateBoundingBoxVisibility;
    private shouldClip;
    private updateVisibilityStructures;
}
export {};
