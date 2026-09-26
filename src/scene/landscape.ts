import * as T from "three";

// A close, upward-looking composition: the pole, its hardware, wires, and open sky.

// How far the camera drifts (scene units) in its slow idle motion.
const CAMERA_SWAY = { x: 0.06, y: 0.035 };

export function mountLandscape(host: HTMLElement, code: string): () => void {
  let disposed = false;
  const renderer = new T.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(64, 1, 0.1, 150);
  const sky = new T.Mesh(
    new T.SphereGeometry(90, 24, 16),
    new T.ShaderMaterial({
      side: T.BackSide,
      depthWrite: false,
      uniforms: {
        zenith: { value: new T.Color("#458db7") },
        horizon: { value: new T.Color("#c6dfdf") },
      },
      vertexShader:
        "varying vec3 direction; void main(){ direction=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader:
        "uniform vec3 zenith; uniform vec3 horizon; varying vec3 direction; void main(){ float h=pow(max(normalize(direction).y,0.0),0.55); gl_FragColor=vec4(mix(horizon,zenith,h),1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}",
    }),
  );
  scene.add(sky);
  // Only the far sky is painted. The pole, plate, hardware and wires remain 3D.
  const distance = 60;
  const skyTexture = new T.TextureLoader().load(
    new URL("../assets/distant-sky.jpg", import.meta.url).href,
    () => {
      if (!disposed) renderer.render(scene, camera);
    },
  );
  skyTexture.colorSpace = T.SRGBColorSpace;
  const backdrop = new T.Mesh(
    new T.PlaneGeometry(1, 1),
    new T.MeshBasicMaterial({ map: skyTexture }),
  );
  scene.add(backdrop);
  scene.add(new T.HemisphereLight("#e0f0fa", "#7c8174", 2));
  const sun = new T.DirectionalLight("#fff0d2", 2.5);
  sun.position.set(-7, 12, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 8, bottom: -5, near: 1, far: 35 });
  sun.shadow.normalBias = 0.025;
  scene.add(sun);
  const ramp = new T.DataTexture(new Uint8Array([110, 179, 230, 255]), 4, 1, T.RedFormat);
  ramp.minFilter = ramp.magFilter = T.NearestFilter;
  ramp.needsUpdate = true;
  const concrete = new T.MeshToonMaterial({ color: "#b6b09b", gradientMap: ramp });
  const metal = new T.MeshStandardMaterial({ color: "#6e7c7c", roughness: 0.65, metalness: 0.35 });
  const porcelain = new T.MeshToonMaterial({ color: "#d2ddd7", gradientMap: ramp });
  const dark = new T.MeshToonMaterial({ color: "#39464a", gradientMap: ramp });
  function mesh(
    geometry: T.BufferGeometry,
    material: T.Material,
    x: number,
    y: number,
    z: number,
    parent: T.Object3D = scene,
  ) {
    const object = new T.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  function box(
    w: number,
    h: number,
    d: number,
    material: T.Material,
    x: number,
    y: number,
    z: number,
    parent: T.Object3D = scene,
  ) {
    return mesh(new T.BoxGeometry(w, h, d), material, x, y, z, parent);
  }
  function wire(points: number[][], radius = 0.014) {
    const curve = new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p)));
    mesh(new T.TubeGeometry(curve, 64, radius, 6, false), dark, 0, 0, 0);
  }
  mesh(new T.CylinderGeometry(0.36, 0.59, 12, 24), concrete, 0, 6, 0);
  // Narrow casting seams and small fasteners give the large simple surface scale.
  for (const y of [2.3, 5.7, 8.6, 11.3]) {
    const radius = 0.59 - (y / 12) * 0.23;
    mesh(new T.CylinderGeometry(radius + 0.004, radius + 0.005, 0.015, 24), metal, 0, y, 0);
  }
  for (const y of [3.1, 4.95, 9.35, 10.45]) {
    const radius = 0.59 - (y / 12) * 0.23;
    mesh(new T.CylinderGeometry(radius + 0.018, radius + 0.02, 0.085, 32, 1, true), metal, 0, y, 0);
  }
  box(3.2, 0.14, 0.18, metal, 0, 9.4, 0);
  box(2.5, 0.12, 0.16, metal, 0, 10.5, 0);
  // Diagonal braces under the crossarm.
  for (const sign of [-1, 1]) {
    const brace = box(0.065, 1.6, 0.065, metal, sign * 0.55, 8.8, 0);
    brace.rotation.z = -sign * 0.75;
  }
  for (const [y, span] of [
    [9.4, 1.32],
    [10.5, 1.03],
  ] as const) {
    for (const x of [-span, span]) {
      mesh(new T.CylinderGeometry(0.045, 0.045, 0.48, 8), metal, x, y + 0.28, 0);
      for (let i = 0; i < 4; i++)
        mesh(new T.CylinderGeometry(0.13, 0.16, 0.075, 16), porcelain, x, y + 0.16 + i * 0.085, 0);
      wire([
        [x - 13, y + 1.5, 15],
        [x - 5, y - 0.1, 6],
        [x, y + 0.51, 0],
        [x + 3.5, y - 1.5, -18],
        [x + 7, y + 0.2, -40],
      ]);
    }
  }
  // One service cable hangs beside the shaft; everything remains actual geometry.
  wire(
    [
      [0.35, 9.4, 0.1],
      [0.72, 8.8, 0.16],
      [0.73, 7.6, 0.2],
      [0.44, 7.25, 0.22],
      [0.36, 8, 0.23],
    ],
    0.022,
  );
  for (const y of [6.1, 7.2, 8.3]) {
    const step = box(0.42, 0.055, 0.08, metal, -0.53, y, 0.1);
    step.rotation.z = -0.08;
  }
  const ochre = new T.MeshToonMaterial({ color: "#c5a041", gradientMap: ramp });
  mesh(new T.CylinderGeometry(0.571, 0.59, 1.15, 24), ochre, 0, 0.8, 0);
  for (let band = 0; band < 2; band++) {
    const vertices: number[] = [],
      indices: number[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      for (const dy of [0, 0.22])
        vertices.push(
          Math.sin(a) * 0.595,
          0.25 + band * 0.5 + (i / 64) * 0.42 + dy,
          Math.cos(a) * 0.595,
        );
      if (i < 64) {
        const k = i * 2;
        indices.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const stripeMaterial = dark.clone();
    stripeMaterial.side = T.DoubleSide;
    mesh(geometry, stripeMaterial, 0, 0, 0);
  }
  const label = new T.Group();
  label.position.set(0.12, 4.05, 0.59);
  label.rotation.y = 0.24;
  scene.add(label);
  const canvas = document.createElement("canvas");
  canvas.width = 192;
  canvas.height = 768;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#eee9d8";
  ctx.fillRect(0, 0, 192, 768);
  ctx.strokeStyle = "#999783";
  ctx.lineWidth = 5;
  ctx.strokeRect(3, 3, 186, 762);
  ctx.fillStyle = "#35443f";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 82px monospace";
  [...code].forEach((character, i) => ctx.fillText(character, 96, 91 + i * 84));
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  const paper = new T.MeshBasicMaterial({ map: texture });
  const backing = new T.MeshToonMaterial({ color: "#c4bfab", gradientMap: ramp });
  const plate = new T.Mesh(new T.BoxGeometry(0.43, 1.72, 0.035), [
    backing,
    backing,
    backing,
    backing,
    paper,
    backing,
  ]);
  label.add(plate);
  plate.castShadow = true;
  for (const y of [-0.8, 0.8]) {
    const bolt = mesh(new T.CylinderGeometry(0.018, 0.018, 0.014, 12), metal, 0, y, 0.027, label);
    bolt.rotation.x = Math.PI / 2;
  }

  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute(
    "aria-label",
    `가까이서 올려다본 3D 전봇대. 전주 전산화번호 ${code}. 먼 구름과 산 능선, 하늘과 전선이 보이며 실제 정답 위치와 무관합니다.`,
  );
  host.appendChild(renderer.domElement);
  const observer = new ResizeObserver(() => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.position.set(0.85, 1.65, 2.65);
    camera.lookAt(0.55, 4.65, 0);
    camera.fov = camera.aspect < 1 ? 62 : 58;
    // A wider mobile crop still gives the plate enough physical screen space.
    label.scale.setScalar(camera.aspect < 1 ? 1 : 1.35);
    camera.updateProjectionMatrix();
    const viewHeight = 2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * distance;
    const viewWidth = viewHeight * camera.aspect;
    backdrop.position
      .copy(camera.position)
      .add(camera.getWorldDirection(new T.Vector3()).multiplyScalar(distance));
    backdrop.quaternion.copy(camera.quaternion);
    const artWidth = Math.max(viewWidth, viewHeight * 1.5);
    const artHeight = artWidth / 1.5;
    backdrop.scale.set(artWidth * 1.025, artHeight * 1.025, 1);
    // Cover without stretching; retain the narrow mountain strip at the bottom.
    backdrop.position.add(
      new T.Vector3(0, (artHeight - viewHeight) / 2, 0).applyQuaternion(camera.quaternion),
    );
    renderer.setSize(width, height);
    renderer.render(scene, camera);
  });
  observer.observe(host);
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const mobile = matchMedia("(max-width: 760px)");
  let previousFrame = 0;
  const started = performance.now();
  function motion() {
    if (reducedMotion.matches || mobile.matches || document.hidden) {
      renderer.setAnimationLoop(null);
      if (reducedMotion.matches) {
        camera.position.set(0.85, 1.65, 2.65);
        camera.lookAt(0.55, 4.65, 0);
        renderer.render(scene, camera);
      }
      return;
    }
    renderer.setAnimationLoop((time) => {
      if (time - previousFrame < 1000 / 30) return;
      previousFrame = time;
      const t = (time - started) / 1000;
      camera.position.set(
        0.85 + Math.sin(t * 0.19) * CAMERA_SWAY.x,
        1.65 + Math.sin(t * 0.13) * CAMERA_SWAY.y,
        2.65,
      );
      camera.lookAt(0.55, 4.65, 0);
      renderer.render(scene, camera);
    });
  }
  reducedMotion.addEventListener("change", motion);
  mobile.addEventListener("change", motion);
  document.addEventListener("visibilitychange", motion);
  motion();
  return () => {
    disposed = true;
    renderer.setAnimationLoop(null);
    observer.disconnect();
    reducedMotion.removeEventListener("change", motion);
    mobile.removeEventListener("change", motion);
    document.removeEventListener("visibilitychange", motion);
    const materials = new Set<T.Material>();
    const geometries = new Set<T.BufferGeometry>();
    scene.traverse((object) => {
      if (object instanceof T.Mesh) {
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material])
          materials.add(material);
      }
    });
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
    skyTexture.dispose();
    texture.dispose();
    ramp.dispose();
    sun.shadow.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
