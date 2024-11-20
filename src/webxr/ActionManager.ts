import { ModelMode, RenderMode } from './types';
import ThreeRenderer from './ThreeRenderer';
import PerformanceLogger from '../components/PerformanceLogger';
import DebugLogger from '../components/DebugLogger';
import SessionProvider from './SessionProvider';
import AlertLogger from '../components/AlertLogger';
import SceneManager from './SceneManager';
import { ModelAnimator } from './ModelAnimator';

export default class ActionManger {
  private static instance: ActionManger;

  private constructor() { }

  public static getInstance(): ActionManger {
    if (!ActionManger.instance) {
      ActionManger.instance = new ActionManger();
    }
    return ActionManger.instance;
  }

  public switchRenderMode(mode: RenderMode): void {
    ThreeRenderer.getInstance().switchRenderMode(mode);
    AlertLogger.getInstance().alert(`Render mode has changed to ${mode}`);
  }

  public switchModelMode(mode: ModelMode): void {
    ModelAnimator.getInstance().switchModelMode(mode);
    AlertLogger.getInstance().alert(`Animation mode has changed to ${mode}`);
  }

  public async startSession() {
    if (!(await SessionProvider.getInstance().requestSession())) return false;
    const session = SessionProvider.getInstance().getSession();
    if (!session) return false;
    ThreeRenderer.getInstance().connectSession(session);
    return true;
  }

  public startRendering() {
    // Render stat info window
    ThreeRenderer.getInstance().addRenderCallback(
      PerformanceLogger.getInstance().updateStats.bind(
        PerformanceLogger.getInstance()
      )
    );
    ThreeRenderer.getInstance().appendToDOM(
      document.getElementById("webgl-container") as HTMLDivElement
    );
    ThreeRenderer.getInstance().startRendering(SceneManager.getInstance().getRenderProps());
  }

  public startLogger() {
    DebugLogger.getInstance().init();
  }

  public endSession() {
    SessionProvider.getInstance().endSession();
  }
  public endRendering() { }
  public endLogger() { }

  public switchModel() {

  }


}
