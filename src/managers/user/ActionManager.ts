import { ModelMode, RenderMode } from '@/managers/types';
import { threeRenderer, sceneManager, modelAnimator, sessionProvider, modelLoader } from '@/managers';

import { performanceLogger, debugLogger, alertLogger } from '@/components';



export default class ActionManager {
  private static instance: ActionManager;

  private constructor() { }

  public static getInstance(): ActionManager {
    if (!ActionManager.instance) {
      ActionManager.instance = new ActionManager();
    }
    return ActionManager.instance;
  }

  public switchRenderMode(mode: RenderMode): void {
    threeRenderer.switchRenderMode(mode);
    alertLogger.alert(`Render mode has changed to ${mode}`);
  }

  public switchModelMode(mode: ModelMode): void {
    modelAnimator.switchModelMode(mode);
    alertLogger.alert(`Animation mode has changed to ${mode}`);
  }

  public async startSession() {
    if (!(await sessionProvider.requestSession())) return false;
    const session = sessionProvider.getSession();
    if (!session) return false;
    threeRenderer.connectSession(session);
    return true;
  }

  public startRendering() {
    // Render stat info window
    threeRenderer.addRenderCallback(
      performanceLogger.updateStats.bind(
        performanceLogger
      )
    );
    threeRenderer.appendToDOM(
      document.getElementById("webgl-container") as HTMLDivElement
    );
    threeRenderer.startRendering(sceneManager.getRenderProps());
  }

  public startLogger() {
    debugLogger.init();
  }

  public endSession() {
    sessionProvider.endSession();
  }
  public endRendering() { }
  public endLogger() { }

  public loadModel(modelUrl: string) {
    modelLoader.loadUserModel(modelUrl).then((model) => {
      modelAnimator.init(model);
      sceneManager.addChildren(model.model);
    })
  }

  public loadCube() {
    const cube = sceneManager.getCube();
    if (cube) modelAnimator.init(cube);

  }

  public rotateWorld(delta: number) {
    if (Math.abs(delta) > 2) {
      threeRenderer.rotateSession(delta / 50);
    }
  }


}
