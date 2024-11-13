import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import ThreeRenderer from "./ThreeRenderer";
import DebugLogger from "../components/DebugLogger";

export class ModelRenderer {
  private static instance: ModelRenderer;

  private loader: GLTFLoader;
  private model: THREE.Object3D | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private action: THREE.AnimationAction | null = null;
  private clock: THREE.Clock | null = null;
  private fixedPosition: THREE.Vector3 | null = null;
  private fixedRotation: THREE.Quaternion | null = null;

  private constructor() {
    this.loader = new GLTFLoader();
  }
  public static getInstance(): ModelRenderer {
    if (!ModelRenderer.instance) {
      ModelRenderer.instance = new ModelRenderer();
    }
    return ModelRenderer.instance;
  }

  public loadModel(modelUrl: string): void {
    this.loader.load(
      modelUrl,
      (gltf) => {
        this.model = gltf.scene as THREE.Object3D;
        this.model.visible = false; // 초기에는 감지 위치에서만 표시되도록 숨김
        this.model.scale.set(0.5, 0.5, 0.5); // 필요에 따라 모델 크기 조정
        ThreeRenderer.getInstance().addModel(this.model);

        if (gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.model);
          this.action = this.mixer.clipAction(gltf.animations[0]); // 첫 번째 애니메이션 선택
          this.action.play(); // 처음에 한번 플레이해서 확인
          this.action.stop(); // 대기 상태
        }
      },
      undefined,
      (err) => DebugLogger.getInstance().log(err)
    );
  }

  // 위치와 회전을 고정하기 위해 호출
  public fixModelPosition(position: THREE.Vector3, rotation: THREE.Quaternion): void {
    this.fixedPosition = position.clone();
    this.fixedRotation = rotation.clone();
    this.updateModelPosition(); // 고정 위치로 모델 업데이트
  }

  // 고정 위치에 모델을 렌더링
  public updateModelPosition(): void {
    if (this.model && this.fixedPosition && this.fixedRotation) {
      this.model.position.copy(this.fixedPosition);
      this.model.setRotationFromQuaternion(this.fixedRotation);
      this.model.visible = true;
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
  public update(): void {
    if (this.mixer && this.clock) {
      this.mixer.update(this.clock.getDelta());
    }
  }
}
