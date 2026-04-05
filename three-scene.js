/* ─── THREE.JS: Chrome Blue 3D Cursor ─────────────── */
(function () {
  const canvas = document.getElementById('three-canvas');

  /* ── Renderer ── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.8;

  /* ── Scene ── */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  /* ── Camera ── */
  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 10);

  /* ══════════════════════════════════════════════════
     CURSOR SHAPE — clockwise, tip at top
  ═══════════════════════════════════════════════════ */
  const shape = new THREE.Shape();
  shape.moveTo(0, 4.0);
  shape.lineTo(3.5, -1.5);
  shape.lineTo(1.8, -0.5);
  shape.lineTo(1.8, -4.2);
  shape.lineTo(0.8, -4.2);
  shape.lineTo(0.8, -0.5);
  shape.lineTo(0.0, -1.5);
  shape.closePath();

  const extrudeSettings = {
    depth: 1.4,
    bevelEnabled: true,
    bevelSegments: 20,
    bevelSize: 0.28,
    bevelThickness: 0.28,
    bevelOffset: 0,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();

  /* ── Chrome blue iridescent material ── */
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0.06, 0.12, 0.9),
    metalness: 1.0,
    roughness: 0.03,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    iridescence: 1.0,
    iridescenceIOR: 2.0,
    iridescenceThicknessRange: [100, 700],
    reflectivity: 1.0,
    envMapIntensity: 1.2,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.z = -Math.PI * 0.22;
  mesh.rotation.x = 0.12;
  mesh.scale.set(0.62, 0.62, 0.62);
  scene.add(mesh);

  /* ════════════════════════════════════
     LIGHTS — craft the chrome blue look
  ════════════════════════════════════ */
  scene.add(new THREE.AmbientLight(0x060618, 2));

  const keyLight = new THREE.PointLight(0x3355ff, 120, 25);
  keyLight.position.set(-4, 6, 7);
  scene.add(keyLight);

  const specLight = new THREE.DirectionalLight(0xffffff, 6);
  specLight.position.set(0.5, 3, 6);
  scene.add(specLight);

  const rimLight = new THREE.PointLight(0x8833ff, 60, 20);
  rimLight.position.set(6, -1, 3);
  scene.add(rimLight);

  const fillLight = new THREE.PointLight(0x0088ff, 35, 20);
  fillLight.position.set(-5, -5, 5);
  scene.add(fillLight);

  const backLight = new THREE.PointLight(0x0011aa, 25, 30);
  backLight.position.set(2, 0, -8);
  scene.add(backLight);

  const topGlint = new THREE.PointLight(0xaabbff, 40, 15);
  topGlint.position.set(-1, 8, 4);
  scene.add(topGlint);

  const envColors = [
    [0x1133ff, 15, [-8, 0, 0]],
    [0x0022cc, 10, [8, 0, 0]],
    [0x0044ff, 12, [0, 8, 0]],
    [0x001188, 8,  [0, -8, 0]],
    [0x2244ff, 14, [0, 0, 8]],
    [0x000055, 6,  [0, 0, -8]],
  ];
  envColors.forEach(([color, intensity, pos]) => {
    const l = new THREE.PointLight(color, intensity, 40);
    l.position.set(...pos);
    scene.add(l);
  });

  /* ── State ── */
  let scrollY = 0, mouseX = 0, mouseY = 0;
  let rotX = 0, rotY = 0;

  window.addEventListener('scroll', () => { scrollY = window.scrollY; });
  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    const targetRotY = scrollY * 0.0025 + mouseX * 0.55;
    const targetRotX = scrollY * 0.0012 + mouseY * 0.3;
    rotX += (targetRotX - rotX) * 0.055;
    rotY += (targetRotY - rotY) * 0.055;

    mesh.rotation.x = 0.12 + rotX + Math.sin(t * 0.28) * 0.06;
    mesh.rotation.y = rotY  + Math.sin(t * 0.22) * 0.10;
    mesh.rotation.z = -Math.PI * 0.22 + Math.sin(t * 0.18) * 0.04;

    keyLight.position.x = -4 + Math.sin(t * 0.35) * 2.5;
    keyLight.position.y =  6 + Math.cos(t * 0.28) * 2.0;
    rimLight.position.x =  6 + Math.cos(t * 0.45) * 2.0;
    rimLight.position.z =  3 + Math.sin(t * 0.38) * 2.5;
    fillLight.position.x = -5 + Math.sin(t * 0.55) * 2.0;
    fillLight.position.y = -5 + Math.cos(t * 0.42) * 1.5;
    topGlint.position.x  = -1 + Math.sin(t * 0.6) * 3.0;
    topGlint.position.z  =  4 + Math.cos(t * 0.5) * 2.0;

    renderer.render(scene, camera);
  }

  animate();
})();
