import WebXRPolyfill from 'webxr-polyfill';
import DebugLogger from '../components/DebugLogger';

export default class SessionProvider {
  private static instance: SessionProvider;
  private session: XRSession | null = null;
  private hitTestSource: XRHitTestSource | null = null;

  private constructor() { }

  // Singleton Instance
  public static getInstance(): SessionProvider {
    if (!SessionProvider.instance) {
      const polyfill = new WebXRPolyfill(); // just in case

      SessionProvider.instance = new SessionProvider();
    }
    return SessionProvider.instance;
  }
  public async isSessionAvailable(): Promise<boolean> {
    if (!navigator.xr) {
      return false
    }
    return await navigator.xr.isSessionSupported("immersive-ar");
  }

  public async requestSession(): Promise<boolean> {
    if (this.session) this.endSession(); // if there is a session already, ends first

    if (!navigator.xr || !this.isSessionAvailable()) {
      return false
    }

    this.session = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['local-floor', 'hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: document.getElementById("react-ui") as HTMLDivElement },
    }).catch((err) => {
      DebugLogger.getInstance().log("error 1");
      DebugLogger.getInstance().log(err.message);

      return false;
    }) as XRSession;

    const viewerSpace = await this.session.requestReferenceSpace("viewer").catch((err) => {
      DebugLogger.getInstance().log(err);
      return false;
    }) as XRReferenceSpace;


    if (typeof this.session.requestHitTestSource !== "function") {
      console.error("requestHitTestSource is not supported in this environment.");
      return false;
    }

    this.hitTestSource = await this.session.requestHitTestSource({
      space: viewerSpace,
    }) as XRHitTestSource;


    return true;
  }

  public getHitTestSource(): XRHitTestSource | null {
    return this.hitTestSource;
  }

  public getSession(): XRSession | null {
    return this.session;
  }

  public endSession(): void {
    if (this.session) {
      this.session.end();
      this.session = null;
    }
  }
}
