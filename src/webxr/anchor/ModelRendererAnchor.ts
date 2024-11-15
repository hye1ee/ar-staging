import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import ThreeRenderer from "../ThreeRenderer";
import DebugLogger from "../../components/DebugLogger";

export class ModelRendererAnchor {
  private static instance: ModelRendererAnchor
    ;

  private loader: GLTFLoader;
  private model: THREE.Object3D | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private action: THREE.AnimationAction | null = null;
  private anchor: XRAnchor | null = null;

  private constructor() {
    this.loader = new GLTFLoader();
  }
  public static getInstance(): ModelRendererAnchor {
    if (!ModelRendererAnchor
      .instance) {
      ModelRendererAnchor
        .instance = new ModelRendererAnchor
          ();
    }
    return ModelRendererAnchor
      .instance;
  }

  public getModel(): THREE.Object3D | null {
    return this.model;
  }

  public loadModel(modelUrl: string): void {
    DebugLogger.getInstance().log(`Start to load mode: ${modelUrl}`)

    this.loader.load(
      modelUrl,
      (gltf) => {
        this.model = gltf.scene as THREE.Object3D;
        this.model.visible = false; // 초기에는 감지 위치에서만 표시되도록 숨김
        this.model.scale.set(0.5, 0.5, 0.5); // 필요에 따라 모델 크기 조정
        ThreeRenderer.getInstance().addModel(this.model);
        DebugLogger.getInstance().log("The model has been successfully loaded.")

        if (gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.model);
          this.action = this.mixer.clipAction(gltf.animations[0]); // 첫 번째 애니메이션 선택
          this.action.play(); // 처음에 한번 플레이해서 확인
          this.action.stop(); // 대기 상태
        }
      },
      undefined,
      (err) => DebugLogger.getInstance().log("Failed to load model")
    );
  }

  public connectAnchor(anchor: XRAnchor): void {
    if (this.model && !this.anchor) {
      this.anchor = anchor;
      this.model.visible = true;
      DebugLogger.getInstance().log("Anchor has connected with the model")
    }
  }

  public getAnchorSpace(): XRSpace | null {
    return this.anchor?.anchorSpace ?? null;
  }

  public disconnectAnchor(): void {
    if (this.anchor && this.model) {
      this.anchor.delete();
      this.anchor = null;
      this.model.visible = false;
      DebugLogger.getInstance().log("The anchor has removed")
    }
  }

  public updatePos(position: THREE.Vector3): void {
    if (this.model) {
      this.model.position.copy(position);
    }
  }

  public updateRot(orientation: THREE.Quaternion): void {
    if (this.model) {
      this.model.setRotationFromQuaternion(orientation);
    }
  }

  // 애니메이션을 처음부터 실행
  public playAnimation(): void {
    if (this.action) {
      this.action.reset(); // 처음으로 이동
      this.action.play(); // 애니메이션 재생
    }
  }

  // 매 프레임마다 호출하여 애니메이션 업데이트
  public update(_frame: XRFrame): void {
    // if (this.mixer && this.clock) {
    //   this.mixer.update(this.clock.getDelta());
    // }
  }
}
