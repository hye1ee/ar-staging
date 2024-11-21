import * as THREE from 'three';
import { sessionProvider } from '@/managers';

import { getTranformProps } from '@/utils';
import { RenderMode, RenderProps } from '@/managers/types';
import { alertLogger, debugLogger, guideCircle } from '@/components';
import { modelAnimator } from '..';

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
    debugLogger.log("Session connected.");
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
    debugLogger.log("Start rendering loop.");
    alertLogger.alert("Start Rendering")
  }


  public getRenderMode(): RenderMode {
    return this.renderMode;
  }
  public switchRenderMode(mode: RenderMode): void {
    if (this.renderMode === mode) return;
    this.renderMode = mode;

    if (this.renderMode === "hit") { // anchor -> hit
      modelAnimator.dislocateModel();
      debugLogger.log("Mode change: hit");
    } else if (this.renderMode === "anchor") { // hit -> anchor
      guideCircle.hideGuide();
      debugLogger.log("Mode change: anchor");
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
      guideCircle.updatePos(position);
      guideCircle.updateRot(orientation);
      guideCircle.showGuide();
      return;
    }
    /* When hit test failed, hide guide */
    guideCircle.hideGuide();
  }

  /* Run hit test and return result */
  public getHitPose(frame: XRFrame): XRPose | null {
    const session = sessionProvider.getSession();
    const hitTestSource = sessionProvider.getHitTestSource();
    if (!session || !hitTestSource) return null;

    const hitTestResults = frame.getHitTestResults(hitTestSource);
    const hitPose = hitTestResults[0]?.getPose(this.renderer.xr.getReferenceSpace() as XRReferenceSpace);
    return hitPose ?? null;
  }

  /* If anchor exist, update model */
  public anchorLoop(frame: XRFrame, time: number): void {
    if (!modelAnimator.isModelLocated()) {
      const hitPose = this.getHitPose(frame);
      if (!hitPose) return;

      // move the world origin
      const offsetTransform = new XRRigidTransform(hitPose.transform.position, hitPose.transform.orientation);
      const newReferenceSpace = this.renderer.xr.getReferenceSpace()?.getOffsetReferenceSpace(offsetTransform);
      if (newReferenceSpace) this.renderer.xr.setReferenceSpace(newReferenceSpace);

      // and then locate model to the origin

      setTimeout(() => {
        modelAnimator.locateModel(hitPose.transform);
      }, 100)
    }
    /* Animation loop */
    modelAnimator.update((time - this.prevTime) / 1000);
    this.prevTime = time;
  }

  public rotateSession(delta: number): void {
    const rotationQuaternion = new THREE.Quaternion();
    rotationQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), delta);
    const offsetTransform = new XRRigidTransform(
      { x: 0, y: 0, z: 0 },
      {
        x: rotationQuaternion.x,
        y: rotationQuaternion.y,
        z: rotationQuaternion.z,
        w: rotationQuaternion.w,
      }
    );

    const newReferenceSpace = this.renderer.xr.getReferenceSpace()?.getOffsetReferenceSpace(offsetTransform);
    if (newReferenceSpace) this.renderer.xr.setReferenceSpace(newReferenceSpace);
  }
}
