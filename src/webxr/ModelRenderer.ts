import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import ThreeRenderer from "./ThreeRenderer";
import DebugLogger from "../components/DebugLogger";


export class ModelRenderer {
  private static instance: ModelRenderer;

  private test: boolean = false;
  private loader: GLTFLoader;
  private model: THREE.Object3D | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private actions: THREE.AnimationAction[] = [];
  private anchor: XRAnchor | null = null;

  private constructor() {
    this.loader = new GLTFLoader();
  }
  public static getInstance(): ModelRenderer {
    if (!ModelRenderer.instance) {
      ModelRenderer.instance = new ModelRenderer();
    }
    return ModelRenderer.instance;
  }

  public getModel(): THREE.Object3D | null {
    return this.model;
  }

  public loadModel(modelUrl: string): void {
    DebugLogger.getInstance().log(`Start to load mode: ${modelUrl}`)
    if (this.test) {
      this.loader.load(
        "/src/assets/cube.glb",
        (gltf) => {
          this.model = gltf.scene as THREE.Group;
          this.model.visible = false;
          this.scaleModel();

          ThreeRenderer.getInstance().addModel(this.model);
          DebugLogger.getInstance().log("The model has been successfully loaded.")

          if (gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(this.model) as THREE.AnimationMixer;

            gltf.animations.forEach((clip) => {
              if (!this.mixer) return;
              const action = this.mixer.clipAction(clip);
              this.actions.push(action); // Action 저장
            });
          }
        },
        undefined,
        (err) => DebugLogger.getInstance().log("Failed to load model")
      );
      return;
    }


    this.loader.load(
      modelUrl,
      (gltf) => {
        this.model = gltf.scene as THREE.Group;
        this.model.visible = false;
        this.scaleModel();

        ThreeRenderer.getInstance().addModel(this.model);
        DebugLogger.getInstance().log("The model has been successfully loaded.")

        if (gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.model) as THREE.AnimationMixer;

          gltf.animations.forEach((clip) => {
            if (!this.mixer) return;
            const action = this.mixer.clipAction(clip);
            this.actions.push(action); // Action 저장
          });
        }
      },
      undefined,
      (err) => DebugLogger.getInstance().log("Failed to load model")
    );
  }

  public scaleModel(): void {
    if (this.model) {
      const boundingBox = new THREE.Box3().setFromObject(this.model);
      const boundingSphere = new THREE.Sphere();
      boundingBox.getBoundingSphere(boundingSphere);
      const scale = 0.2 / boundingSphere.radius;
      this.model.scale.set(scale, scale, scale);

      DebugLogger.getInstance().log("The model has been scaled");
    }
  }

  public connectAnchor(anchor: XRAnchor): void {
    if (this.model && !this.anchor) {
      this.anchor = anchor;
      this.model.visible = true;
      DebugLogger.getInstance().log("Anchor has connected with the model")
    }
  }

  public isLocated(): boolean {
    return this.model?.visible ?? false;
  }

  public locate(position: THREE.Vector3, orientation: THREE.Quaternion): void {
    if (this.model) {
      this.updatePos(position);
      this.updateRot(orientation);
      this.model.visible = true;
    }
  }

  public disloacte(): void {
    if (this.model) {
      this.model.visible = false;
    }
  }

  private updatePos(position: THREE.Vector3): void {
    if (this.model) {
      this.model.position.copy(position);
    }
  }

  private updateRot(orientation: THREE.Quaternion): void {
    if (this.model) {
      this.model.setRotationFromQuaternion(orientation);
    }
  }

  /* TODO: Remove unnecessary methods later */
  public playAnimation(): void {
    if (this.actions) {
      DebugLogger.getInstance().log("Start animation");
      this.actions.forEach(action => {
        if (action.paused) action.paused = false;
        else action.play(); // at first, paused value is false
      });
    }
  }
  public stopAnimation(): void {
    if (this.actions) {
      DebugLogger.getInstance().log("Stop animation");
      this.actions.forEach(action => action.stop());
    }
  }
  public pauseAnimation(): void {
    if (this.actions) {
      DebugLogger.getInstance().log("Pause animation");
      this.actions.forEach(action => action.paused = true);
    }
  }

  // 매 프레임마다 호출하여 애니메이션 업데이트
  public update(deltaTime: number): void {
    if (this.mixer) {
      this.mixer.update(deltaTime)
    }

    // if (this.mixer && this.clock) {
    //   this.mixer.update(this.clock.getDelta());
    // }
  }
}
