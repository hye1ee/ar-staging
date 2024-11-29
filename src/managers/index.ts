import ModelAnimator from "@/managers/session/ModelAnimator";
import ModelLoader from "@/managers/session/ModelLoader";
import SceneManager from "@/managers/session/SceneManager";
import SessionProvider from "@/managers/session/SessionProvider";
import ThreeRenderer from "@/managers/session/ThreeRenderer";

import ActionManager from "@/managers/user/ActionManager";
import IndexedDBManager from "@/managers/user/IndexedDBManager";

export const modelAnimator = ModelAnimator.getInstance();
export const modelLoader = ModelLoader.getInstance();
export const sceneManager = SceneManager.getInstance();
export const sessionProvider = SessionProvider.getInstance();
export const threeRenderer = ThreeRenderer.getInstance();
export const actionManager = ActionManager.getInstance();
export const indexedDbManager = IndexedDBManager.getInstance();