/* ─── THREE.JS: Chrome Blue 3D Cursor ─────────────── */
(function () {
  const canvas = document.getElementById('three-canvas');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.5, 9);

  /* ── Cursor shape ── */
  const shape = new THREE.Shape();
  shape.moveTo(0,    4.0);
  shape.lineTo(3.5, -1.5);
  shape.lineTo(1.8, -0.5);
  shape.lineTo(1.8, -4.2);
  shape.lineTo(0.8, -4.2);
  shape.lineTo(0.8, -0.5);
  shape.lineTo(0.0, -1.5);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 1.5,
    bevelEnabled: true,
    bevelSegments: 24,
    bevelSize: 0.30,
    bevelThickness: 0.30,
  });
  geo.center();

  /* ── Chrome-blue Phong material (visible without HDR env map) ── */
  const mat = new THREE.MeshPhongMaterial({
    color:    new THREE.Color(0.08, 0.18, 0.95),  // rich cobalt blue
    emissive: new THREE.Color(0.01, 0.04, 0.22),  // dark-blue base glow
    specular: new THREE.Color(0.8,  0.85, 1.0),   // cool-white specular
    shininess: 600,
    flatShading: false,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.z = -Math.PI * 0.22;
  mesh.rotation.x =  0.14;
  mesh.scale.set(0.60, 0.60, 0.60);
  scene.add(mesh);

  /* ═══════════════════════════════
     LIGHTS  –  craft chrome look
  ═══════════════════════════════ */

  /* ambient — enough to see dark areas */
  scene.add(new THREE.AmbientLight(0x1a2a80, 4));

  /* key: bright white from upper-left → big highlight */
  const key = new THREE.DirectionalLight(0xffffff, 10);
  key.position.set(-3, 6, 6);
  scene.add(key);

  /* fill: blue from upper-right */
  const fill = new THREE.DirectionalLight(0x4466ff, 5);
  fill.position.set(5, 3, 4);
  scene.add(fill);

  /* rim: violet from lower-right-back */
  const rim = new THREE.DirectionalLight(0x9933ff, 4);
  rim.position.set(4, -4, -3);
  scene.add(rim);

  /* front: soft cyan from below */
  const front = new THREE.DirectionalLight(0x33aaff, 3);
  front.position.set(-2, -5, 5);
  scene.add(front);

  /* moving point lights for live reflections */
  const pt1 = new THREE.PointLight(0x5577ff, 80, 20);
  pt1.position.set(-3, 5, 6);
  scene.add(pt1);

  const pt2 = new THREE.PointLight(0xffffff, 40, 15);
  pt2.position.set(2, 2, 7);
  scene.add(pt2);

  const pt3 = new THREE.PointLight(0x8833ff, 50, 18);
  pt3.position.set(5, -2, 4);
  scene.add(pt3);

  /* ── State ── */
  let scrollY = 0, mouseX = 0, mouseY = 0;
  let rotX = 0, rotY = 0;

  window.addEventListener('scroll',    () => { scrollY = window.scrollY; });
  window.addEventListener('mousemove', e  => {
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

    const tRY = scrollY * 0.0025 + mouseX * 0.5;
    const tRX = scrollY * 0.0012 + mouseY * 0.28;
    rotX += (tRX - rotX) * 0.055;
    rotY += (tRY - rotY) * 0.055;

    mesh.rotation.x = 0.14 + rotX + Math.sin(t * 0.27) * 0.06;
    mesh.rotation.y = rotY       + Math.sin(t * 0.21) * 0.09;
    mesh.rotation.z = -Math.PI * 0.22 + Math.sin(t * 0.17) * 0.04;

    /* orbit lights for dynamic chrome shimmer */
    pt1.position.set(
      -3 + Math.sin(t * 0.38) * 3,
       5 + Math.cos(t * 0.30) * 2,
       6
    );
    pt2.position.set(
       2 + Math.cos(t * 0.44) * 2.5,
       2 + Math.sin(t * 0.36) * 1.5,
       7 + Math.sin(t * 0.28) * 1.5
    );
    pt3.position.set(
       5 + Math.cos(t * 0.52) * 2,
      -2 + Math.sin(t * 0.40) * 2,
       4 + Math.cos(t * 0.33) * 2
    );

    renderer.render(scene, camera);
  }

  animate();
})();
