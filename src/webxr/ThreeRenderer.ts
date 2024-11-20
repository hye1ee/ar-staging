import * as THREE from 'three';
import SessionProvider from './SessionProvider';
import DebugLogger from '../components/DebugLogger';
import GuideCircle from '../components/GuideCircle';
import { getTranformProps } from './utils';
import AlertLogger from '../components/AlertLogger';
import { ModelAnimator } from './ModelAnimator';
import { RenderMode, RenderProps } from './types';

export default class ThreeRenderer {
  private static instance: ThreeRenderer;

  private renderer: THREE.WebGLRenderer;
  private renderMode: RenderMode = "hit";

  private prevTime: number = 0;

  private renderCallback: (() => void)[] = [];

  private constructor() {
    // Set up renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
  }

  public static getInstance(): ThreeRenderer {
    if (!ThreeRenderer.instance) {
      ThreeRenderer.instance = new ThreeRenderer();
    }
    return ThreeRenderer.instance;
  }

  /*
   * ----------------------------------------------------------------
   * [1] THREE Renderer
  */
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
  public startRendering({ scene, camera }: RenderProps): void {
    this.renderer.setAnimationLoop((time, frame) => {
      if (frame) {
        if (this.renderMode === "hit") this.hitLoop(frame);
        else if (this.renderMode === "anchor") this.anchorLoop(frame, time);
        this.renderer.render(scene, camera);
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
      ModelAnimator.getInstance().dislocateModel();
      DebugLogger.getInstance().log("Mode change: hit");
    } else if (this.renderMode === "anchor") { // hit -> anchor
      GuideCircle.getInstance().hideGuide();
      DebugLogger.getInstance().log("Mode change: anchor");
    }
  }

  /*
   * ----------------------------------------------------------------
   * [3] AR Session
  */

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
    if (ModelAnimator.getInstance().isModelLocated()) {
      const hitPose = this.getHitPose(frame);
      if (!hitPose) return;
      ModelAnimator.getInstance().locateModel(hitPose.transform);
    }
    /* Animation loop */
    ModelAnimator.getInstance().update((time - this.prevTime) / 1000);
    this.prevTime = time;
  }
}
