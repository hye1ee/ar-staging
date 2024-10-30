/// <reference types="vite/client" />

interface Window {
  webkit?: {
    messageHandlers: {
      startAR: {
        postMessage: (message: any) => void;
      };
    };
  };
}
declare module 'webxr-polyfill' {
  export default class WebXRPolyfill {
    constructor();
    nativeWebXR;
  }
}
