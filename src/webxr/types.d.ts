import * as THREE from "three"

export interface UserModel {
  model: THREE.Object3D;
  mixer: THREE.AnimationMixer | null;
  actions: THREE.AnimationAction[];
}

export interface RenderProps {
  scene: THREE.Scene;
  camera: THREE.Camera;
}

export type RenderMode = "hit" | "anchor" | "film";
export type ModelMode = "pause" | "play" | "stop";