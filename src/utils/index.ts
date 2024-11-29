import * as THREE from 'three';

// constant
export const TEST_CUBE_URL = "/models/cube.glb"
export const HDRI_URL = "/models/studio.hdr";

// socket utils
export const isValidWsUrl = ({ ip, port }: { ip: string, port: string }) => {
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;
  const portNum = Number(port)
  return ipv4Regex.test(ip) && Number.isInteger(portNum) && portNum >= 0 && portNum <= 65535;
}

export const downloadBlob = (file: Blob) => {
  const link = document.createElement("a") as unknown as HTMLAnchorElement;
  const url = URL.createObjectURL(file);
  link.href = url;
  link.download = "scene.glb";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


// user model utils
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

export const scaleModel = (model: THREE.Object3D): void => {
  const boundingBox = new THREE.Box3().setFromObject(model);
  const boundingSphere = new THREE.Sphere();
  boundingBox.getBoundingSphere(boundingSphere);
  const scale = 0.2 / boundingSphere.radius;
  model.scale.set(scale, scale, scale);
}

export const locateModel = (model: THREE.Object3D, _transform: XRRigidTransform) => {
  // const { position, orientation } = getTranformProps(transform);
  updateModelPosition(model, new THREE.Vector3(0, 0, 0));
  // updateModelPosition(model, position);

  // updateModelRotation(model, orientation);
  model.visible = true;
}

export const isModelLocated = (model: THREE.Object3D) => {
  return model.visible;
}

export const dislocateModel = (model: THREE.Object3D) => {
  model.visible = false;
}

export const updateModelPosition = (model: THREE.Object3D, position: THREE.Vector3): void => {
  model.position.copy(position);
}

export const updateModelRotation = (model: THREE.Object3D, orientation: THREE.Quaternion): void => {
  model.setRotationFromQuaternion(orientation);
}