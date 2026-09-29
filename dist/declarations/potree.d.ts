import { Camera, DataTexture, Object3D, Ray, WebGLRenderer } from 'three';
import { GetUrlFn } from './loading';
import { PointCloudOctree } from './point-cloud-octree';
import { PickParams } from './point-cloud-octree-picker';
import { MaskConfig } from './mask/types';
import { IPointCloudTreeNode, IPotree, IVisibilityUpdateResult, PCOGeometry, PickPoint } from './types';
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
    private masks;
    /**
     * The packed mask texture both this library's point cloud shader and any other renderer in the
     * scene sample. Allocated once at a fixed size and only ever rewritten — see `mask/constants`.
     */
    private readonly maskTexture;
    /**
     * Whether the mask path has been compiled into the point cloud shader. Latched on the first
     * `setMaskConfig` and never unlatched: a lasso mask changes on every click, and a shader
     * recompile per vertex — which a region-count `#define` would force — is not viable.
     */
    private maskShaderEnabled;
    /**
     * The packed mask texture, for another material in the scene to mask by exactly the same data.
     * It is the live texture, not a copy: bind it once and every later mask change reaches it.
     */
    get maskDataTexture(): DataTexture;
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
     * Set the mask the point clouds render through.
     *
     * Regions come in their natural form — an oriented box, or a polygon prism given as a closed
     * coplanar outline extruded infinitely both ways along its plane normal. This library fits each
     * prism's plane basis, flattens it, and packs every region into one texture the shader samples.
     *
     * **Order is significant.** Regions paint in list order and a later region overwrites an earlier
     * one where they overlap, so an outline can carve a hole out of an earlier one and a further
     * outline can put part of that hole back.
     *
     * @param config The mask's regions (in order) and the opacity for points inside none of them.
     * @param scene Optional scene to add debug AABB helpers to. Prisms have no finite AABB, so only
     *   boxes get one.
     *
     * @example
     * ```typescript
     * // Show only inside a box (defaultOpacity=0, region.opacity=1)
     * potree.setMaskConfig({
     *   regions: [
     *     {
     *       id: 'region-1',
     *       center: new Vector3(0, 0, 10),
     *       rotation: [1, 0, 0, 0, 1, 0, 0, 0, 1], // Identity rotation (9-element array)
     *       extent: new Vector3(20, 20, 20), // Total size of the region
     *       opacity: 1.0, // Visible inside
     *     }
     *   ],
     *   defaultOpacity: 0.0 // Outside is hidden
     * });
     *
     * // Keep an outlined region, then cut a hole out of it
     * potree.setMaskConfig({
     *   regions: [
     *     { id: 'keep', kind: MaskRegionKind.Prism, positions: outline, opacity: 1.0 },
     *     {
     *       id: 'hole',
     *       kind: MaskRegionKind.Prism,
     *       positions: hole,
     *       operation: MaskOperation.Exclude,
     *       opacity: 1.0,
     *     },
     *   ],
     *   defaultOpacity: 0.0
     * });
     * ```
     */
    setMaskConfig(config: MaskConfig, scene?: Object3D): void;
    /**
     * Clear all mask regions and restore default visibility
     *
     * @param scene The Three.js scene to remove mask region helpers from. Must be the same scene used when setting the mask config.
     */
    clearMaskConfig(scene: Object3D): void;
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
