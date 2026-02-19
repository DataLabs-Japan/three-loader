import { Box3, Color, LineSegments, Matrix4, Object3D } from 'three';
/**
 *
 * code adapted from three.js BoxHelper.js
 * https://github.com/mrdoob/three.js/blob/dev/src/helpers/BoxHelper.js
 *
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / http://github.com/Mugen87
 * @author mschuetz / http://potree.org
 */
export declare class Box3Helper extends LineSegments {
    constructor(box: Box3, color?: Color);
}
/**
 * Clear a helper plane mesh from the object.
 * Provide Scene if object was added directly to the scene.
 *
 * Removes all children from the object with the given name.
 *
 * @param object The Three.js Parent object to remove the helper from.
 * @param name The name of the helper mesh to remove.
 */
export declare const clearHelper: (object: Object3D, name: string) => void;
/**
 * Add a Box3Helper to visualize a Box3 in the scene.
 *
 * @param scene Object3D to add the helper to
 * @param name Name of the helper object
 * @param box Box3 to visualize
 * @param color Color of the helper lines
 */
export declare const addBox3Helper: (scene: Object3D, name: string, box: Box3, color?: number) => Box3Helper;
/**
 * Add an oriented Box3Helper to visualize a Box3 with a model matrix in the scene.
 * Will use manually construct the boundary using Line2 since Box3Helper is AABB only.
 *
 * @param scene Object3D to add the helper to
 * @param name Name of the helper object
 * @param box Box3 to visualize
 * @param modelMatrix Matrix4 representing the orientation and position of the box
 * @param color Color of the helper lines
 */
export declare const addOrientedBox3Helper: (scene: Object3D, name: string, box: Box3, modelMatrix: Matrix4, color?: number) => LineSegments;
export default Box3Helper;
