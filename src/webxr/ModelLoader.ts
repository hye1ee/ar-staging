import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import DebugLogger from "../components/DebugLogger";
import { scaleModel, TEST_CUBE_URL } from "./utils";
import { UserModel } from "./types";


export class ModelLoader {
  private static instance: ModelLoader;

  private loader: GLTFLoader;

  private constructor() {
    this.loader = new GLTFLoader();
  }
  public static getInstance(): ModelLoader {
    if (!ModelLoader.instance) {
      ModelLoader.instance = new ModelLoader();
    }
    return ModelLoader.instance;
  }

  public loadTestCube(): Promise<UserModel> {
    return new Promise((res, rej) => {
      this.loader.load(
        TEST_CUBE_URL,
        (gltf) => {
          const testCube = gltf.scene as THREE.Group;
          testCube.visible = false;
          testCube.name = "ar-staging/testcube";
          scaleModel(testCube);

          let mixer: THREE.AnimationMixer | null = null;
          let actions: THREE.AnimationAction[] = [];
          if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(testCube) as THREE.AnimationMixer;

            gltf.animations.forEach((clip) => {
              if (!mixer) return;
              const action = mixer.clipAction(clip);
              actions.push(action); // Action 저장
            });
          }
          DebugLogger.getInstance().log("Success to load testcube");
          res({ model: testCube, mixer, actions });
        },
        undefined,
        () => {
          rej();
          DebugLogger.getInstance().log("Failed to load model");
        }
      );
    })
  }

  public loadUserModel(modelUrl: string): Promise<UserModel> {
    return new Promise((res, rej) => {
      this.loader.load(
        modelUrl,
        (gltf) => {
          const model = gltf.scene as THREE.Group;
          model.visible = false;
          model.name = "ar-staging/scene";
          scaleModel(model);

          let mixer: THREE.AnimationMixer | null = null;
          let actions: THREE.AnimationAction[] = [];
          if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model) as THREE.AnimationMixer;

            gltf.animations.forEach((clip) => {
              if (!mixer) return;
              const action = mixer.clipAction(clip);
              actions.push(action); // Action 저장
            });
          }
          DebugLogger.getInstance().log(`Success to load model :${model.name}`);
          res({ model, mixer, actions });
        },
        undefined,
        () => {
          rej();
          DebugLogger.getInstance().log("Failed to load model");
        }
      );
    })
  }
}
