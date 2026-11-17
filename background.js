// ============================================================
// Site-wide animated 3D background (Section 2 of the brief).
// Scoped down to one warm, stylised Tuscan-café-glow scene shared
// across pages (rather than five fully-modelled interiors) — see
// the chat summary for why. Falls back to the CSS gradient in
// #bg-fallback on WebGL failure, low-end devices, or reduced motion.
// ============================================================
import * as THREE from "three";

const fallbackEl = document.getElementById("bg-fallback");
const canvas = document.getElementById("bg-canvas");

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const isLowEnd = (navigator.hardwareConcurrency || 4) <= 2;

if (isLowEnd) {
  // Keep the static gradient; never touch the canvas.
} else {
  try {
    initBackground();
  } catch (e) {
    // WebGL unavailable or failed — the CSS gradient fallback stays visible.
    console.warn("3D background unavailable, using fallback.", e);
  }
}

function initBackground() {
  canvas.classList.remove("hidden");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xb7410e, 0.025);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.4, 7);

  const ambient = new THREE.AmbientLight(0xffe3b0, 0.8);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffb066, 1.1);
  sun.position.set(-4, 5, 3);
  scene.add(sun);

  // Warm sky-dome gradient, standing in for the terrace / piazza sky.
  const skyGeo = new THREE.SphereGeometry(40, 24, 16);
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      top: { value: new THREE.Color(0xf3c572) },
      bottom: { value: new THREE.Color(0x8a3a16) },
    },
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vPos;
      uniform vec3 top;
      uniform vec3 bottom;
      void main() {
        float h = normalize(vPos).y * 0.5 + 0.5;
        gl_FragColor = vec4(mix(bottom, top, h), 1.0);
      }
    `,
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));

  // Distant cypress trees, like a Tuscan hillside through the window.
  const cypressGroup = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3b2417 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x4b5a1f });
  for (let i = 0; i < 9; i++) {
    const cypress = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.4, 6), trunkMat);
    trunk.position.y = 0.2;
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.6, 7), leafMat);
    leaves.position.y = 1.0;
    cypress.add(trunk, leaves);
    cypress.position.set((i - 4) * 1.8 + (Math.random() - 0.5), -0.6, -10 - Math.random() * 3);
    cypressGroup.add(cypress);
  }
  scene.add(cypressGroup);

  // Floating dust motes drifting through the golden light.
  const moteCount = 120;
  const moteGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(moteCount * 3);
  for (let i = 0; i < moteCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = Math.random() * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10 + 2;
  }
  moteGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const moteMat = new THREE.PointsMaterial({ color: 0xffe6b3, size: 0.03, transparent: true, opacity: 0.6 });
  const motes = new THREE.Points(moteGeo, moteMat);
  scene.add(motes);

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onResize);

  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running && !motionQuery.matches) animate();
  });

  // Task 7: reduced motion → render one static frame and stop the
  // loop entirely, instead of a continuous animation. Listens live.
  motionQuery.addEventListener("change", () => {
    if (!motionQuery.matches) animate();
  });

  const clock = new THREE.Clock();
  function animate() {
    if (motionQuery.matches) {
      renderer.render(scene, camera);
      return;
    }
    requestAnimationFrame(animate);
    if (!running) return;
    const t = clock.getElapsedTime();

    camera.position.x = Math.sin(t * 0.08) * 0.3;
    camera.lookAt(0, 1, -5);

    const pos = moteGeo.attributes.position;
    for (let i = 0; i < moteCount; i++) {
      pos.array[i * 3 + 1] += 0.0015;
      if (pos.array[i * 3 + 1] > 5) pos.array[i * 3 + 1] = 0;
    }
    pos.needsUpdate = true;

    cypressGroup.children.forEach((c, i) => {
      c.rotation.z = Math.sin(t * 0.6 + i) * 0.02;
    });

    renderer.render(scene, camera);
  }
  animate();
}
