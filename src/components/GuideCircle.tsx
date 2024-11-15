import * as THREE from "three";

export default class GuideCircle {
  private static instance: GuideCircle;
  private model: THREE.Group;

  private constructor() {
    // Test guideCircle
    // const pinkMat = new THREE.MeshBasicMaterial({
    //   color: 0xff0c81,
    //   opacity: 0.04,
    //   transparent: true,
    // });

    const whiteMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0.1,
      transparent: true,
    });

    const guide1 = new THREE.Mesh(new THREE.CircleGeometry(0.15, 64), whiteMat);
    const guide2 = new THREE.Mesh(new THREE.CircleGeometry(0.1, 64), whiteMat);
    guide2.position.z += 0.01;
    const guide3 = new THREE.Mesh(new THREE.CircleGeometry(0.05, 64), whiteMat);
    guide3.position.z += 0.02;

    this.model = new THREE.Group();
    this.model.add(guide1, guide2, guide3);

    this.model.visible = false;
  }

  public static getInstance(): GuideCircle {
    if (!GuideCircle.instance) {
      GuideCircle.instance = new GuideCircle();
    }
    return GuideCircle.instance;
  }

  public getModel(): THREE.Group {
    return this.model;
  }

  public hideGuide(): void {
    this.model.visible = false;
  }

  public showGuide(): void {
    this.model.visible = true;
  }

  public updatePos(position: THREE.Vector3): void {
    this.model.position.copy(position);
  }

  public updateRot(orientation: THREE.Quaternion): void {
    const euler = new THREE.Euler().setFromQuaternion(orientation, "YXZ");
    euler.x = -Math.PI / 2; // make it parallel to the floor
    this.model.setRotationFromEuler(euler);
  }
}
