import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

async function loadShaders() {
  const vertexShader = await fetch('./Shaders/VoidVertex.glsl').then(res => res.text());
  const fragmentShader = await fetch('./Shaders/VoidFragment.glsl').then(res => res.text());

  init(vertexShader, fragmentShader);
}

function init(vertexShader, fragmentShader) {
  const scene = new THREE.Scene();

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  document.body.appendChild(renderer.domElement);

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight)
      },
      uMouse: {
        value: new THREE.Vector2(0, 0)
      }
    }
  });

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    material
  );

  scene.add(mesh);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    material.uniforms.uTime.value = clock.getElapsedTime();

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);

    material.uniforms.uResolution.value.set(
      window.innerWidth,
      window.innerHeight
    );
  });

  window.addEventListener('mousemove', (event) => {
    material.uniforms.uMouse.value.set(
      event.clientX / window.innerWidth,
      1.0 - event.clientY / window.innerHeight
    );
  });
}

loadShaders();