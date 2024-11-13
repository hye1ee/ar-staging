import * as THREE from 'three';
import SessionProvider from './SessionProvider';
import DebugLogger from '../components/DebugLogger';
import { ModelRenderer } from './ModelRenderer';

export default class ThreeRenderer {
  private static instance: ThreeRenderer;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private guideCircle: THREE.Group;


  private constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);

    // Test guideCircle
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0.1,
      transparent: true,
    });

    const guide1 = new THREE.Mesh(new THREE.CircleGeometry(0.15, 64), material);
    const guide2 = new THREE.Mesh(new THREE.CircleGeometry(0.10, 64), material);
    guide2.position.z += 0.01
    const guide3 = new THREE.Mesh(new THREE.CircleGeometry(0.05, 64), material);
    guide3.position.z += 0.02

    this.guideCircle = new THREE.Group();
    this.guideCircle.add(guide1, guide2, guide3);

    this.guideCircle.visible = false;
    this.scene.add(this.guideCircle);
  }

  public static getInstance(): ThreeRenderer {
    if (!ThreeRenderer.instance) {
      ThreeRenderer.instance = new ThreeRenderer();
    }
    return ThreeRenderer.instance;
  }

  public appendToDOM(container: HTMLElement): void {
    container.appendChild(this.renderer.domElement);
  }

  public connectSession(session: XRSession): void {
    this.renderer.xr.setSession(session);
    DebugLogger.getInstance().log("Session connected.");
  }

  public startRendering(): void {
    this.renderer.setAnimationLoop((_timestamp, frame) => {
      if (frame) this.hitTest(frame);
      this.renderer.render(this.scene, this.camera);
      ModelRenderer.getInstance().update();
    });
    DebugLogger.getInstance().log("Start rendering loop.");
  }

  public hitTest(frame: XRFrame): void {
    const session = SessionProvider.getInstance().getSession();
    const hitTestSource = SessionProvider.getInstance().getHitTestSource();
    if (!session || !hitTestSource) return;

    // const referenceSpace = await session.requestReferenceSpace("local-floor");
    const hitTestResults = frame.getHitTestResults(hitTestSource);

    // hit-test 결과가 존재하면 큐브 위치 업데이트
    if (hitTestResults.length > 0) {
      const hitPose = hitTestResults[0].getPose(this.renderer.xr.getReferenceSpace() as XRReferenceSpace);

      if (hitPose) {
        const { position, orientation } = hitPose.transform;

        this.guideCircle.position.set(position.x, position.y, position.z);
        const euler = new THREE.Euler().setFromQuaternion(new THREE.Quaternion(
          orientation.x,
          orientation.y,
          orientation.z,
          orientation.w
        ), "YXZ");
        euler.x = -Math.PI / 2; // 바닥과 평행하도록 X축으로 90도 회전
        this.guideCircle.setRotationFromEuler(euler);
        this.guideCircle.visible = true;
      }
    } else {
      this.guideCircle.visible = false;
    }
  }

  // 외부에서 Three.js의 scene과 camera에 접근할 필요가 있는 경우에만 제공
  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public addModel(model: THREE.Object3D) {
    this.scene.add(model);
  }
}
