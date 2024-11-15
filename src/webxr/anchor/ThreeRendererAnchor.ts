import * as THREE from 'three';
import SessionProvider from '../SessionProvider';
import DebugLogger from '../../components/DebugLogger';
import { ModelRendererAnchor } from './ModelRendererAnchor';
import GuideCircle from '../../components/GuideCircle';
import { getTranformProps } from '../utils';

export type RenderMode = "hit" | "anchor"

export default class ThreeRendererAnchor {
  private static instance: ThreeRendererAnchor
    ;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private mode: RenderMode = "hit";


  private constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);

    this.scene.add(GuideCircle.getInstance().getModel())
  }

  public static getInstance(): ThreeRendererAnchor {
    if (!ThreeRendererAnchor
      .instance) {
      ThreeRendererAnchor
        .instance = new ThreeRendererAnchor
          ();
    }
    return ThreeRendererAnchor
      .instance;
  }

  public appendToDOM(container: HTMLElement): void {
    container.appendChild(this.renderer.domElement);
  }

  public connectSession(session: XRSession): void {
    this.renderer.xr.setSession(session);
    DebugLogger.getInstance().log("Session connected.");
  }

  public startRendering(): void {
    this.renderer.setAnimationLoop((_timestamp, frame) => {
      if (frame) {
        if (this.mode === "hit") this.hitLoop(frame);
        else if (this.mode === "anchor") this.anchorLoop(frame);
        this.renderer.render(this.scene, this.camera);
        // ModelRendererAnchor.getInstance().update();
      }
    });
    DebugLogger.getInstance().log("Start rendering loop.");
  }

  public switchMode(mode: RenderMode): void {
    if (this.mode === mode) return;
    this.mode = mode;

    if (this.mode === "hit") { // anchor -> hit
      ModelRendererAnchor.getInstance().disconnectAnchor();
      DebugLogger.getInstance().log("Mode change: hit");
    } else if (this.mode === "anchor") { // hit -> anchor
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
  public anchorLoop(frame: XRFrame): void {
    const anchorSpace = ModelRendererAnchor.getInstance().getAnchorSpace();

    if (!anchorSpace) { // connect anchor first
      const hitPose = this.getHitPose(frame);
      if (typeof frame.createAnchor !== "function" || !hitPose) {
        DebugLogger.getInstance().log("anchor API is not supported in this environment");
        DebugLogger.getInstance().log(frame.createAnchor);
        if (hitPose) {
          const { position, orientation } = getTranformProps(hitPose.transform);
          ModelRendererAnchor.getInstance().updatePos(position);
          ModelRendererAnchor.getInstance().updateRot(orientation);
        }

        // this.switchMode("hit"); // if anchor API doesn't work, return back to the hit mode
        return;
      }
      frame.createAnchor(hitPose.transform, this.renderer.xr.getReferenceSpace() as XRSpace)?.then((anchor) => {
        ModelRendererAnchor.getInstance().connectAnchor(anchor);
      });
    } else { // if anchor exist, update model
      const anchorPose = frame.getPose(anchorSpace, this.renderer.xr.getReferenceSpace() as XRReferenceSpace);
      if (anchorPose) {
        const { position, orientation } = getTranformProps(anchorPose.transform);
        ModelRendererAnchor.getInstance().updatePos(position);
        ModelRendererAnchor.getInstance().updateRot(orientation);
        return;
      }
      /* TODO: Update Model Animation Frame */
      // ModelRendererAnchor.getInstance().update(frame);
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
