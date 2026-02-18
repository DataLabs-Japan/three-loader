import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments,
  Object3D,
} from 'three';

/**
 *
 * code adapted from three.js BoxHelper.js
 * https://github.com/mrdoob/three.js/blob/dev/src/helpers/BoxHelper.js
 *
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / http://github.com/Mugen87
 * @author mschuetz / http://potree.org
 */

export class Box3Helper extends LineSegments {
  constructor(box: Box3, color: Color = new Color(0xffff00)) {
    // prettier-ignore
    const indices = new Uint16Array([ 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 ]);
    // prettier-ignore
    const positions = new Float32Array([
      box.min.x, box.min.y, box.min.z,
      box.max.x, box.min.y, box.min.z,
      box.max.x, box.min.y, box.max.z,
      box.min.x, box.min.y, box.max.z,
      box.min.x, box.max.y, box.min.z,
      box.max.x, box.max.y, box.min.z,
      box.max.x, box.max.y, box.max.z,
      box.min.x, box.max.y, box.max.z
    ]);

    const geometry = new BufferGeometry();
    geometry.setIndex(new BufferAttribute(indices, 1));
    geometry.setAttribute('position', new BufferAttribute(positions, 3));

    const material = new LineBasicMaterial({ color: color });

    super(geometry, material);
  }
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
export const clearHelper = (object: Object3D, name: string) => {
  object.children
    .filter(child => child.name === name)
    .forEach(child => {
      object.remove(child);
    });
};

/**
 * Add a Box3Helper to visualize a Box3 in the scene.
 *
 * @param scene Object3D to add the helper to
 * @param name Name of the helper object
 * @param box Box3 to visualize
 * @param color Color of the helper lines
 */
export const addBox3Helper = (
  scene: Object3D,
  name: string,
  box: Box3,
  color = 0x00ff00,
): Box3Helper => {
  clearHelper(scene, name);

  const boxHelper = new Box3Helper(box, new Color(color));
  boxHelper.name = name;
  boxHelper.userData.type = 'debug';

  scene.add(boxHelper);
  return boxHelper;
};
