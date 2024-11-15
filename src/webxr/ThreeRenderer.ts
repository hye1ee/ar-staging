import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

import SessionProvider from './SessionProvider';
import DebugLogger from '../components/DebugLogger';
import { ModelRenderer } from './ModelRenderer';
import GuideCircle from '../components/GuideCircle';
import { getTranformProps } from './utils';
import AlertLogger from '../components/AlertLogger';

export type RenderMode = "hit" | "anchor"
export type ModelMode = "pause" | "play" | "stop"

export default class ThreeRenderer {
  private static instance: ThreeRenderer;

  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;

  private camera: THREE.PerspectiveCamera;
  private renderMode: RenderMode = "hit";
  private modelMode: ModelMode = "stop";

  private prevTime: number = 0;
  private hdriUrl: string = "/src/assets/studio.hdr";

  private renderCallback: (() => void)[] = [];

  private constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);

    this.scene.add(GuideCircle.getInstance().getModel());
    this.setHDRIEnv();
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
  public addRenderCallback(callback: () => void): void {
    this.renderCallback.push(callback);
  }

  /* Rendering Loop */
  public startRendering(): void {
    this.renderer.setAnimationLoop((time, frame) => {
      if (frame) {
        if (this.renderMode === "hit") this.hitLoop(frame);
        else if (this.renderMode === "anchor") this.anchorLoop(frame, time);
        this.renderer.render(this.scene, this.camera);
        this.renderCallback.forEach((callback) => callback());
      }
    });
    DebugLogger.getInstance().log("Start rendering loop.");
    AlertLogger.getInstance().alert("Start Rendering")
  }

  public getRenderMode(): RenderMode {
    return this.renderMode;
  }

  public switchRenderMode(mode: RenderMode): void {
    if (this.renderMode === mode) return;
    this.renderMode = mode;

    if (this.renderMode === "hit") { // anchor -> hit
      ModelRenderer.getInstance().disloacte();
      DebugLogger.getInstance().log("Mode change: hit");
    } else if (this.renderMode === "anchor") { // hit -> anchor
      GuideCircle.getInstance().hideGuide();
      DebugLogger.getInstance().log("Mode change: anchor");
    }
  }

  /* If hit test result exist, update guide circle */
  public hitLoop(frame: XRFrame): void {
    const hitPose = this.getHitPose(frame);
    if (hitPose) { /* Update and show guide, only when the hit test successed */
      const { position, orientation } = getTranformProps(hitPose.transform);
      GuideCircle.getInstance().updatePos(position);
      GuideCircle.getInstance().updateRot(orientation);
      GuideCircle.getInstance().showGuide();
      return;
    }
    /* When hit test failed, hide guide */
    GuideCircle.getInstance().hideGuide();
  }

  /* Run hit test and return result */
  public getHitPose(frame: XRFrame): XRPose | null {
    const session = SessionProvider.getInstance().getSession();
    const hitTestSource = SessionProvider.getInstance().getHitTestSource();
    if (!session || !hitTestSource) return null;

    const hitTestResults = frame.getHitTestResults(hitTestSource);
    const hitPose = hitTestResults[0]?.getPose(this.renderer.xr.getReferenceSpace() as XRReferenceSpace);
    return hitPose ?? null;
  }

  /* If anchor exist, update model */
  public anchorLoop(frame: XRFrame, time: number): void {
    if (!ModelRenderer.getInstance().isLocated()) {
      const hitPose = this.getHitPose(frame);
      if (!hitPose) return;
      const { position, orientation } = getTranformProps(hitPose.transform);
      ModelRenderer.getInstance().locate(position, orientation);
    }
    /* Animation loop */
    ModelRenderer.getInstance().update((time - this.prevTime) / 1000);
    this.prevTime = time;
  }

  public setHDRIEnv(): void {
    DebugLogger.getInstance().log("Start to load HDRI Env");

    const rgbeLoader = new RGBELoader();

    rgbeLoader.load(this.hdriUrl, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.environment = texture;

      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;

      DebugLogger.getInstance().log("HDR environment map applied.");
    });
  }


  public getModelMode(): ModelMode {
    return this.modelMode;
  }

  public switchModelMode(mode: ModelMode): void {
    if (this.modelMode === mode) return;
    this.modelMode = mode;

    if (this.modelMode === "play") {
      ModelRenderer.getInstance().playAnimation();
    } else if (this.modelMode === "pause") {
      ModelRenderer.getInstance().pauseAnimation();
    } else if (this.modelMode === "stop") {
      ModelRenderer.getInstance().stopAnimation();
    }
  }

  /* TODO: Remove unnecessary utils */
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
