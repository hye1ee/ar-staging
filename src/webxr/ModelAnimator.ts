import * as THREE from "three";
import DebugLogger from "../components/DebugLogger";
import { ModelMode, UserModel } from "./types";
import { dislocateModel, isModelLocated, locateModel } from "./utils";


export class ModelAnimator {
  private static instance: ModelAnimator;

  private model: THREE.Object3D | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private actions: THREE.AnimationAction[] = [];

  private modelMode: ModelMode = "stop";

  private constructor() { }
  public static getInstance(): ModelAnimator {
    if (!ModelAnimator.instance) {
      ModelAnimator.instance = new ModelAnimator();
    }
    return ModelAnimator.instance;
  }

  public init(model: UserModel) {
    DebugLogger.getInstance().log(`Init model animator with the model: ${model.model.name}`);
    this.model = model.model;
    this.mixer = model.mixer;
    this.actions = model.actions;
  }

  public getModelMode(): ModelMode {
    return this.modelMode;
  }
  public switchModelMode(mode: ModelMode): void {
    if (this.modelMode === mode) return;
    this.modelMode = mode;

    if (this.modelMode === "play") {
      this.playAnimation();
    } else if (this.modelMode === "pause") {
      this.pauseAnimation();
    } else if (this.modelMode === "stop") {
      this.stopAnimation();
    }
  }


  public isModelLocated(): boolean {
    if (this.model) return isModelLocated(this.model);
    return false;
  }

  public locateModel(transform: XRRigidTransform): void {
    if (this.model) locateModel(this.model, transform);
  }

  public dislocateModel() {
    if (this.model) dislocateModel(this.model)
  }

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

  public update(deltaTime: number): void {
    if (this.mixer) {
      this.mixer.update(deltaTime)
    }
  }
}
