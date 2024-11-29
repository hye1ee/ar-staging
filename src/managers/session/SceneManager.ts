import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import { debugLogger, guideCircle } from '@/components';
import { modelLoader, modelAnimator } from '@/managers';

import { HDRI_URL } from '@/utils';
import { RenderProps } from '@/managers/types';

export default class SceneManager {
  private static instance: SceneManager;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private constructor() {
    // Construct scene environment
    this.scene = new THREE.Scene();
    this.setHDRIEnv();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);

    // Add guidecircle and testcube
    this.scene.add(guideCircle.getModel());
    modelLoader.loadTestCube().then((testCube) => {
      modelAnimator.init(testCube.model);
      this.scene.add(testCube.model);
    });

    this.scene.add(new THREE.AxesHelper(1));

    debugLogger.log("Initialize scene");
  }

  public static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }

  /*
   * ----------------------------------------------------------------
   * In the scene, there will be always only three models
   * 1. ar-staging/guidecircle
   * 2. ar-staging/testcube
   * 3. ar-staging/scene -> user load gltf model
   */

  public setHDRIEnv(): void {
    const rgbeLoader = new RGBELoader();

    rgbeLoader.load(HDRI_URL, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.environment = texture;

      // TODO: Move Setting to the renderer
      // this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      // this.renderer.toneMappingExposure = 1.0;

      debugLogger.log("HDR environment map applied.");
    });
  }

  public getRenderProps(): RenderProps {
    return { scene: this.scene, camera: this.camera }
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public addChildren(model: THREE.Object3D) {
    this.scene.add(model)
  }

  public getZoom(): number {
    return this.camera.fov
  }

  public setZoom(zoom: number): void {
    this.camera.fov = zoom;
    this.camera.updateProjectionMatrix();
    console.log(this.camera, zoom);


  }

  /*
   * ----------------------------------------------------------------
   * User Model Managing
  */
  // public loadUserModel(url: string) {
  //   this.removeUserModel();
  //   modelLoader.loadUserModel(url).then((model) => this.addChildren(model));
  // }

  public getUserModel(): THREE.Object3D | null {
    return this.scene.getObjectByName("ar-staging/scene") ?? null;
  }

  public getCube(): THREE.Object3D | null {
    return this.scene.getObjectByName("ar-staging/testcube") ?? null;
  }

  public isUserModelExist(): boolean {
    return this.getUserModel() !== null;
  }

  public removeUserModel() {
    if (this.isUserModelExist()) {
      const model = this.getUserModel() as THREE.Object3D;
      this.scene.remove(model);

      // Dispose all nested children by traversing the scene
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Dispose geometry
          child.geometry.dispose();
          // Dispose material
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          } else if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          }
          // Dispose textures if exist
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((material) => {
            if (material.map) material.map.dispose();
            if (material.normalMap) material.normalMap.dispose();
            if (material.roughnessMap) material.roughnessMap.dispose();
            if (material.metalnessMap) material.metalnessMap.dispose();
            if (material.envMap) material.envMap.dispose();
          });
        }
      });
    }
  }
}
