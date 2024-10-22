import * as THREE from 'three';

const test = document.createElement("div")
test.innerText = "This is a test app"
const body = document.getElementById("body")
const button = document.createElement("button")
button.innerText = "start AR"

body?.append(test)
body?.append(button)

if ('xr' in navigator) {
  navigator.xr?.isSessionSupported('immersive-ar').then((supported) => {
    if (supported) {
      button.addEventListener('click', () => {
        navigator.xr?.requestSession('immersive-ar', { requiredFeatures: ['local-floor'] })
          .then(onSessionStarted);
      });
    } else {
      test.innerText = "AR not supported"
      button.disabled = true;
      console.error('AR not supported');
    }
  });
} else {
  test.innerText = "WebXR not available"
  button.disabled = true;
}

function onSessionStarted(session: XRSession) {
  test.innerText += "/n session started"
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);
  const gl = canvas.getContext('webgl', { xrCompatible: true }) as WebGLRenderingContext;

  const renderer = new THREE.WebGLRenderer({ canvas, context: gl });
  renderer.autoClear = false;

  session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });

  session.requestReferenceSpace('local-floor').then((refSpace) => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    function onXRFrame(_t: number, frame: XRFrame) {
      session.requestAnimationFrame(onXRFrame);

      const pose = frame.getViewerPose(refSpace);
      if (pose) {
        const view = pose.views[0];
        const viewport = session.renderState.baseLayer!.getViewport(view) as XRViewport;
        renderer.setSize(viewport.width, viewport.height);

        camera.matrix.fromArray(view.transform.matrix);
        camera.updateMatrixWorld(true);

        renderer.clear();
        renderer.render(scene, camera);
      }
    }
    session.requestAnimationFrame(onXRFrame);
  });
}
