import * as THREE from 'three';


export const getTranformProps = (transform: XRRigidTransform): { position: THREE.Vector3, orientation: THREE.Quaternion } => {
  return {
    position: new THREE.Vector3(transform.position.x, transform.position.y, transform.position.z),
    orientation: new THREE.Quaternion(
      transform.orientation.x,
      transform.orientation.y,
      transform.orientation.z,
      transform.orientation.w
    )
  }
}