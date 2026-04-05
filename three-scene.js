/* ─── THREE.JS SCENE: Abstract 3D rotating model ─── */
(function () {
  const canvas = document.getElementById('three-canvas');

  // ── Renderer ──
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;

  // ── Scene ──
  const scene = new THREE.Scene();

  // ── Camera ──
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5.5);

  // ── Lights ──
  // Ambient
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  // Main directional
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
  dirLight.position.set(3, 5, 5);
  scene.add(dirLight);

  // Accent — warm terracotta fill
  const fillLight = new THREE.PointLight(0xc84b31, 3.5, 18);
  fillLight.position.set(-3, -2, 3);
  scene.add(fillLight);

  // Cool backlight
  const backLight = new THREE.PointLight(0x8ab4f8, 2.0, 18);
  backLight.position.set(2, 3, -4);
  scene.add(backLight);

  // Soft top
  const topLight = new THREE.PointLight(0xffd6b0, 1.5, 12);
  topLight.position.set(0, 5, 2);
  scene.add(topLight);

  // ── Environment (fake IBL using hemisphere) ──
  const hemi = new THREE.HemisphereLight(0xfff0e0, 0xe0e8ff, 0.6);
  scene.add(hemi);

  // ── Main mesh: TorusKnot with physical chrome/iridescent material ──
  const geo = new THREE.TorusKnotGeometry(1.0, 0.34, 256, 48, 3, 5);

  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.92,
    roughness: 0.08,
    reflectivity: 1.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    iridescence: 1.0,
    iridescenceIOR: 1.6,
    iridescenceThicknessRange: [200, 800],
    envMapIntensity: 2.0,
  });

  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  // ── Secondary mesh: outer transparent shell ──
  const shellGeo = new THREE.TorusKnotGeometry(1.18, 0.06, 200, 32, 3, 5);
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.5,
    roughness: 0.0,
    transparent: true,
    opacity: 0.18,
    wireframe: false,
    side: THREE.DoubleSide,
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  scene.add(shell);

  // ── Tiny floating spheres (particles) ──
  const particles = [];
  const sphereGeo = new THREE.SphereGeometry(0.03, 12, 12);

  for (let i = 0; i < 28; i++) {
    const sm = new THREE.MeshPhysicalMaterial({
      color: i % 3 === 0 ? 0xc84b31 : i % 3 === 1 ? 0xffffff : 0x8ab4f8,
      metalness: 0.8,
      roughness: 0.1,
      transparent: true,
      opacity: 0.7 + Math.random() * 0.3,
    });
    const sphere = new THREE.Mesh(sphereGeo, sm);

    const angle  = (i / 28) * Math.PI * 2;
    const radius = 1.5 + Math.random() * 0.8;
    const height = (Math.random() - 0.5) * 2.4;

    sphere.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );
    sphere.userData = { angle, radius, height, speed: 0.2 + Math.random() * 0.4, phase: Math.random() * Math.PI * 2 };
    scene.add(sphere);
    particles.push(sphere);
  }

  // ── Scroll state ──
  let scrollY = 0;
  let targetRotX = 0;
  let targetRotY = 0;
  let currentRotX = 0;
  let currentRotY = 0;

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // ── Mouse parallax ──
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 0.6;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.6;
  });

  // ── Resize ──
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  // ── Animation loop ──
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Scroll drives rotation
    targetRotY = scrollY * 0.0018 + mouseX * 0.8;
    targetRotX = scrollY * 0.0008 + mouseY * 0.5;

    // Smooth lerp
    currentRotX += (targetRotX - currentRotX) * 0.06;
    currentRotY += (targetRotY - currentRotY) * 0.06;

    // Base idle rotation
    mesh.rotation.x = currentRotX + Math.sin(t * 0.22) * 0.12;
    mesh.rotation.y = currentRotY + t * 0.18;
    mesh.rotation.z = Math.sin(t * 0.15) * 0.05;

    shell.rotation.x = mesh.rotation.x * 0.95 + 0.1;
    shell.rotation.y = mesh.rotation.y * 0.95;
    shell.rotation.z = mesh.rotation.z;

    // Animate particles
    particles.forEach(p => {
      const ud = p.userData;
      const a  = ud.angle + t * ud.speed * 0.4;
      p.position.x = Math.cos(a) * ud.radius;
      p.position.z = Math.sin(a) * ud.radius;
      p.position.y = ud.height + Math.sin(t * ud.speed + ud.phase) * 0.3;
    });

    // Animate lights
    fillLight.position.x = Math.sin(t * 0.5) * 3;
    fillLight.position.y = Math.cos(t * 0.3) * 2;
    backLight.position.x = Math.cos(t * 0.4) * 3;

    // Move model slightly based on scroll
    mesh.position.y = -scrollY * 0.0008;
    shell.position.y = mesh.position.y;

    renderer.render(scene, camera);
  }

  animate();
})();
