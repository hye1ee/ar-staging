// import * as THREE from 'three';
// // WebXR Polyfill 불러오기
// // Polyfill 초기화
// // const polyfill = new WebXRPolyfill();
// // console.log('WebXR Polyfill initialized!', polyfill);
// // navigator.xr = polyfill.nativeWebXR || navigator.xr;

// import WebXRPolyfill from 'webxr-polyfill';
// const polyfill = new WebXRPolyfill();

// const test: HTMLDivElement = document.createElement("div");
// const button: HTMLButtonElement = document.createElement("button");
// const body = document.getElementById("body") as HTMLBodyElement;

// const checkOS = (): 'iPhone' | 'iPad' | 'Macintosh' | 'Android' | 'etc' => {
//   const userAgent: string | undefined = navigator.userAgent as string;

//   if (userAgent) {
//     if (userAgent.indexOf('Android') !== -1) {
//       return 'Android';
//     }
//     if (userAgent.indexOf('iPhone') !== -1) {
//       return 'iPhone';
//     }
//     if (userAgent.indexOf('iPad') !== -1) {
//       return 'iPad';
//     }
//     if (userAgent.indexOf('Macintosh') !== -1) {
//       return 'Macintosh';
//     }
//   }
//   return 'etc';
// };

// const init = () => {
//   // register service worker
//   // if ("serviceWorker" in navigator) {
//   //   window.addEventListener("load", () => {
//   //     navigator.serviceWorker.register("/polyfill/webxr-worker.js").then(
//   //       (registration) => {
//   //         console.log("Service Worker registered with scope:", registration.scope);
//   //       },
//   //       (error) => {
//   //         console.error("Service Worker registration failed:", error);
//   //       }
//   //     );
//   //   });
//   // }
//   test.innerText = "This is a test app"
//   button.innerText = "start AR"

//   body?.append(test)
//   body?.append(button)
// }

// const prepareAR = () => {
//   if ('xr' in navigator) {
//     // [1] WebXR supported
//     if (startWebXR()) return;
//   }

//   // if WebXR is not supported try AR kit first and then WebXR Viewer
//   const os = checkOS();
//   if (os === 'iPhone' || os === 'iPad' || os === 'Macintosh') {
//     // [2] use ARKit
//     if (window.webkit && window.webkit.messageHandlers.startAR) {
//       window.webkit.messageHandlers.startAR.postMessage({});
//       return;
//     }
//   }
//   // [3] use WebXR Viewer
//   window.location.href = `xrviewer://open-url/?url=${window.location.href}`

// }

// const startWebXR = (): boolean => {
//   navigator.xr?.isSessionSupported('immersive-ar').then((supported) => {
//     if (supported) {
//       button.addEventListener('click', () => {
//         button.innerText += "\n clicked!";
//         navigator.xr?.requestSession('immersive-ar', { requiredFeatures: ['local-floor'] })
//           .then(onSessionStarted)
//           .catch(() => { test.innerText += "\n failed to request session" })
//       });
//       return true;
//     } else {
//       test.innerText += `\nimmersive ar is not supported`
//       return false;
//     }
//   });
//   return false;
// }

// function onSessionStarted(session: XRSession) {
//   test.innerText += "/n session started"
//   const canvas = document.createElement('canvas');
//   document.body.appendChild(canvas);
//   const gl = canvas.getContext('webgl', { xrCompatible: true }) as WebGLRenderingContext;

//   const renderer = new THREE.WebGLRenderer({ canvas, context: gl });
//   renderer.autoClear = false;

//   session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });

//   session.requestReferenceSpace('local-floor').then((refSpace) => {
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

//     const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
//     const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
//     const cube = new THREE.Mesh(geometry, material);
//     scene.add(cube);

//     function onXRFrame(_t: number, frame: XRFrame) {
//       session.requestAnimationFrame(onXRFrame);

//       const pose = frame.getViewerPose(refSpace);
//       if (pose) {
//         const view = pose.views[0];
//         const viewport = session.renderState.baseLayer!.getViewport(view) as XRViewport;
//         renderer.setSize(viewport.width, viewport.height);

//         camera.matrix.fromArray(view.transform.matrix);
//         camera.updateMatrixWorld(true);

//         renderer.clear();
//         renderer.render(scene, camera);
//       }
//     }
//     session.requestAnimationFrame(onXRFrame);
//   });
// }

// init();
// // prepareAR();
// startWebXR();

//
import WebXRPolyfill from 'webxr-polyfill';

const startButton = document.createElement('button');
// Polyfill 초기화
const polyfill = new WebXRPolyfill();
console.log('Polyfill initialized:', polyfill);

let xrSession: XRSession | null = null;
let xrRefSpace: XRReferenceSpace | null = null;

async function startAR() {
  try {
    xrSession = await navigator.xr?.requestSession('immersive-ar', {
      requiredFeatures: ['local-floor'], // 필수 기능 설정
    }) ?? null;

    if (xrSession) {
      startButton.innerText += "\n get session"
      xrRefSpace = await xrSession.requestReferenceSpace('local-floor');
      xrSession.requestAnimationFrame(onXRFrame);
      console.log('AR Session started');
    }
    else startButton.innerText += "\n failed"
  } catch (error) {
    startButton.innerText += `\n failed to start ar ${error}`
  }
}

function onXRFrame(time: DOMHighResTimeStamp, frame: XRFrame) {
  const session = frame.session;
  session.requestAnimationFrame(onXRFrame);

  const pose = frame.getViewerPose(xrRefSpace!);
  if (pose) {
    console.log('Viewer Pose detected:', pose);
    // AR 콘텐츠 렌더링 코드 추가
  }
}

document.body.appendChild(startButton);
startButton.innerText = "start ar";
startButton.onclick = startAR

