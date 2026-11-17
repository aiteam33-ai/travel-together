// ============================================================
// Welcome intro (Section 3 of the brief): plays once per browser
// session. No rigged .glb model is available, so per the brief's
// own fallback allowance, the walking figure is a stylised low-poly
// character animated procedurally (box/cone primitives, no GLTF).
// ============================================================
import * as THREE from "three";

const introScreen = document.getElementById("intro-screen");
const introCanvas = document.getElementById("intro-canvas");
const skipBtn = document.getElementById("skip-intro-btn");

const SESSION_KEY = "trattoriaIntroShown";
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let introStopped = false;

let alreadyShown = false;
try {
  alreadyShown = sessionStorage.getItem(SESSION_KEY) === "true";
} catch (e) {
  alreadyShown = false;
}

if (alreadyShown || motionQuery.matches) {
  dismissIntro(true);
} else {
  skipBtn.addEventListener("click", () => dismissIntro());
  // Task 7: if reduced motion turns on mid-animation, skip straight
  // to the site rather than finishing the walk/door sequence.
  motionQuery.addEventListener("change", (e) => {
    if (e.matches) dismissIntro();
  });
  try {
    runIntroScene();
  } catch (e) {
    console.warn("Intro 3D scene unavailable, skipping straight to the site.", e);
    dismissIntro();
  }
}

function dismissIntro(instant) {
  introStopped = true;
  try { sessionStorage.setItem(SESSION_KEY, "true"); } catch (e) {}
  if (instant) {
    introScreen.style.display = "none";
    return;
  }
  introScreen.classList.add("leaving");
  setTimeout(() => { introScreen.style.display = "none"; }, 900);
}

function runIntroScene() {
  const renderer = new THREE.WebGLRenderer({ canvas: introCanvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xd9823f, 0.035);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.6, 6);

  scene.add(new THREE.AmbientLight(0xffdca0, 0.9));
  const sun = new THREE.DirectionalLight(0xffb066, 1.2);
  sun.position.set(-5, 6, 4);
  scene.add(sun);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x8a6a3f })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.5;
  scene.add(ground);

  // Rolling olive hills behind
  const hillMat = new THREE.MeshStandardMaterial({ color: 0x6b6b2f });
  for (let i = 0; i < 5; i++) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(3 + i, 12, 8), hillMat);
    hill.position.set((i - 2) * 4, -3 - i * 0.3, -14 - i * 2);
    scene.add(hill);
  }

  // Cypress trees
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3b2417 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x3f4d1a });
  for (let i = 0; i < 6; i++) {
    const cypress = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.6, 6), trunkMat);
    trunk.position.y = 0.3;
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.4, 7), leafMat);
    leaves.position.y = 1.5;
    cypress.add(trunk, leaves);
    cypress.position.set(-6 + i * 2.4, -0.5, -6 - (i % 2) * 1.5);
    scene.add(cypress);
  }

  // Stone castle (simple keep + two towers) in the background
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x9c8468 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x5a3a22 });
  const castle = new THREE.Group();
  const keep = new THREE.Mesh(new THREE.BoxGeometry(3, 2.2, 2), stoneMat);
  keep.position.y = 0.6;
  castle.add(keep);
  [-1.6, 1.6].forEach((x) => {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.8, 10), stoneMat);
    tower.position.set(x, 0.8, 0);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.8, 10), roofMat);
    roof.position.set(x, 2.6, 0);
    castle.add(tower, roof);
  });
  castle.position.set(0, -0.3, -10);
  castle.scale.setScalar(1.3);
  scene.add(castle);

  // --- Ornate castle doors (two leaves, hinge on the outer edge) ---
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x3b2417 });
  const doorGroupLeft = new THREE.Group();
  const doorGroupRight = new THREE.Group();
  const doorLeaf = new THREE.BoxGeometry(0.9, 2.2, 0.08);

  const leftDoor = new THREE.Mesh(doorLeaf, doorMat);
  leftDoor.position.x = 0.45; // offset so the group's own origin is the hinge
  doorGroupLeft.add(leftDoor);
  doorGroupLeft.position.set(-0.9, 1.0, -8.95);

  const rightDoor = new THREE.Mesh(doorLeaf, doorMat);
  rightDoor.position.x = -0.45;
  doorGroupRight.add(rightDoor);
  doorGroupRight.position.set(0.9, 1.0, -8.95);

  scene.add(doorGroupLeft, doorGroupRight);

  // --- Procedural low-poly walking figure (stand-in for a rigged model) ---
  const suitMat = new THREE.MeshStandardMaterial({ color: 0x27303a });
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xcf9f78 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x1a1410 });

  const figure = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.3), suitMat);
  torso.position.y = 1.1;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), skinMat);
  head.position.y = 1.65;
  figure.add(torso, head);

  function makeLimb(material, length) {
    const limb = new THREE.Mesh(new THREE.BoxGeometry(0.14, length, 0.14), material);
    limb.geometry.translate(0, -length / 2, 0); // pivot at the top
    return limb;
  }

  const legL = makeLimb(suitMat, 0.75);
  const legR = makeLimb(suitMat, 0.75);
  legL.position.set(-0.12, 0.75, 0);
  legR.position.set(0.12, 0.75, 0);
  const shoeL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.26), shoeMat);
  const shoeR = shoeL.clone();
  shoeL.position.set(0, -0.75, 0.05);
  shoeR.position.set(0, -0.75, 0.05);
  legL.add(shoeL);
  legR.add(shoeR);

  const armL = makeLimb(suitMat, 0.55);
  const armR = makeLimb(suitMat, 0.55);
  armL.position.set(-0.32, 1.42, 0);
  armR.position.set(0.32, 1.42, 0);

  figure.add(legL, legR, armL, armR);
  figure.position.set(-6, 0, -1);
  scene.add(figure);

  // --- Timeline: walk across, then push the doors open ---
  const WALK_DURATION = 4.5; // seconds to cross the screen
  const WALK_END_X = 0.4;
  const DOOR_OPEN_AT = WALK_DURATION;
  const DOOR_OPEN_DURATION = 1.2;
  const FINISH_AT = DOOR_OPEN_AT + DOOR_OPEN_DURATION + 1.0;

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onResize);

  const clock = new THREE.Clock();
  let finished = false;

  function animate() {
    if (finished || introStopped) return;
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Gentle camera sway throughout.
    camera.position.x += Math.sin(t * 0.5) * 0.0015;
    camera.lookAt(0, 1, -6);

    if (t < WALK_DURATION) {
      const progress = t / WALK_DURATION;
      figure.position.x = -6 + progress * (WALK_END_X + 6);
      figure.position.y = Math.abs(Math.sin(t * 6)) * 0.03; // slight body bob
      const swing = Math.sin(t * 6) * 0.6;
      legL.rotation.x = swing;
      legR.rotation.x = -swing;
      armL.rotation.x = -swing;
      armR.rotation.x = swing;
    } else if (t < DOOR_OPEN_AT + DOOR_OPEN_DURATION) {
      const doorProgress = Math.min(1, (t - DOOR_OPEN_AT) / DOOR_OPEN_DURATION);
      doorGroupLeft.rotation.y = -doorProgress * (Math.PI / 1.8);
      doorGroupRight.rotation.y = doorProgress * (Math.PI / 1.8);
      camera.position.z = 6 - doorProgress * 1.5;
    } else {
      // Drift forward through the open doorway, then fade out.
      const driftT = t - (DOOR_OPEN_AT + DOOR_OPEN_DURATION);
      camera.position.z = 4.5 - driftT * 1.2;
    }

    renderer.render(scene, camera);

    if (t >= FINISH_AT && !finished) {
      finished = true;
      dismissIntro();
    }
  }
  animate();
}
