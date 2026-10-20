import * as T from "./assets/vendor/three.module.js?v=ce1fa418de16a19495a9f72495580e3015d7745c296d3ce0485897f902ddedfb";
import { createRenderControl } from "./render-control.js?v=37253f0cea0acd696b7e0a6efb32a0c9e5229cc876bf998b8f34d3248e645f4c";
const canvas = document.querySelector("#product-canvas"),
  story = document.querySelector(".story"),
  reduced = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v) => Math.min(1, Math.max(0, v)),
  ease = (v) => {
    v = clamp(v);
    return v * v * (3 - 2 * v);
  },
  mix = (a, b, t) => a + (b - a) * t;
const colours = { calm: "#bc8872", dew: "#819d82", restore: "#8b718d" };
let renderer,
  scene,
  camera,
  bottle,
  pump,
  pearls,
  ribbon,
  body,
  print,
  control,
  progress = 0,
  variant = "calm",
  px = 0;
export function setProductVariant(value) {
  variant = value;
  control?.invalidate();
}
const poses = [
  { x: 1.65, y: 0, s: 1.35, ry: -0.38, rz: -0.2 },
  { x: -1.55, y: -0.12, s: 1.22, ry: 0.28, rz: 0.12 },
  { x: 2.1, y: -0.25, s: 2.05, ry: -0.46, rz: -0.18 },
  { x: -1.6, y: -0.02, s: 1.33, ry: 0.08, rz: 0 },
];
function environment() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const x = c.getContext("2d");
  x.fillStyle = "#8e7865";
  x.fillRect(0, 0, 512, 256);
  x.fillStyle = "#fff2df";
  x.fillRect(35, 15, 45, 200);
  x.fillRect(310, 0, 90, 90);
  x.fillStyle = "#382b26";
  x.fillRect(180, 0, 70, 256);
  x.fillStyle = "#e9c6a8";
  x.fillRect(450, 80, 15, 140);
  const map = new T.CanvasTexture(c);
  map.mapping = T.EquirectangularReflectionMapping;
  map.colorSpace = T.SRGBColorSpace;
  const pm = new T.PMREMGenerator(renderer),
    target = pm.fromEquirectangular(map);
  pm.dispose();
  map.dispose();
  return target.texture;
}
function label() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 768;
  const x = c.getContext("2d");
  x.fillStyle = "#e9dcc7";
  x.fillRect(0, 0, 512, 768);
  x.fillStyle = "#352820";
  x.textAlign = "center";
  x.font = "142px Instrument";
  x.fillText("VEIL", 256, 250);
  x.font = "17px DM";
  x.fillText("THE DAILY VEIL", 256, 321);
  x.font = "italic 26px Instrument";
  x.fillText("skin, in its own time.", 256, 377);
  x.strokeStyle = "#9d8774";
  x.beginPath();
  x.moveTo(150, 450);
  x.lineTo(362, 450);
  x.stroke();
  x.font = "13px DM";
  x.fillText("A QUIETER KIND OF SKINCARE", 256, 505);
  x.font = "18px DM";
  x.fillText("50 ml / 1.7 fl oz", 256, 650);
  const tex = new T.CanvasTexture(c);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}
function vessel(profile, material) {
  return new T.Mesh(
    new T.LatheGeometry(
      profile.map((a) => new T.Vector2(...a)),
      64,
    ),
    material,
  );
}
function cylinder(r, h, y, material, parent = bottle) {
  const m = new T.Mesh(new T.CylinderGeometry(r, r, h, 40), material);
  m.position.y = y;
  parent.add(m);
  return m;
}
function build() {
  renderer = new T.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0, 0);
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  scene = new T.Scene();
  scene.environment = environment();
  camera = new T.PerspectiveCamera(34, 1, 0.1, 30);
  camera.position.set(0, 0.1, 10);
  scene.add(new T.HemisphereLight(0xfff9ef, 0x423127, 1.1));
  const key = new T.DirectionalLight(0xffedda, 2.1);
  key.position.set(-4, 6, 5);
  scene.add(key);
  const rim = new T.DirectionalLight(0xffe7c8, 1.5);
  rim.position.set(5, 2, -3);
  scene.add(rim);
  bottle = new T.Group();
  scene.add(bottle);
  // Opaque coated resin gives a readable silhouette with zero transmission passes.
  body = new T.MeshPhysicalMaterial({
    color: colours.calm,
    roughness: 0.23,
    metalness: 0.11,
    clearcoat: 0.85,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.2,
  });
  const bodyMesh = vessel(
    [
      [0, -1.26],
      [0.38, -1.26],
      [0.49, -1.23],
      [0.55, -1.11],
      [0.56, -0.9],
      [0.56, 0.64],
      [0.55, 0.85],
      [0.48, 1.01],
      [0.24, 1.11],
      [0.21, 1.22],
      [0, 1.22],
    ],
    body,
  );
  bottle.add(bodyMesh);
  // Fine vertical ribs catch the large studio reflection. Geometry, not a blurry photograph.
  const edgeMat = new T.MeshStandardMaterial({
    color: 0xa27860,
    metalness: 0.28,
    roughness: 0.4,
  });
  for (let i = 0; i < 22; i++) {
    const angle = (i / 22) * Math.PI * 2;
    if (Math.cos(angle) > 0.5) continue;
    const rib = new T.Mesh(
      new T.CylinderGeometry(0.007, 0.007, 1.7, 5),
      edgeMat,
    );
    rib.position.set(Math.sin(angle) * 0.56, -0.13, Math.cos(angle) * 0.56);
    bottle.add(rib);
  }
  const metal = new T.MeshStandardMaterial({
    color: 0xbaa277,
    metalness: 0.8,
    roughness: 0.27,
  });
  cylinder(0.22, 0.21, 1.21, metal);
  cylinder(0.235, 0.036, 1.1, metal);
  cylinder(0.225, 0.025, 1.32, metal);
  pump = new T.Group();
  pump.position.y = 1.43;
  bottle.add(pump);
  const ceramic = new T.MeshStandardMaterial({
    color: 0xddd4c3,
    metalness: 0.05,
    roughness: 0.29,
  });
  cylinder(0.145, 0.19, -0.03, ceramic, pump);
  const shape = new T.Shape();
  shape.moveTo(-0.16, -0.05);
  shape.lineTo(0.36, -0.05);
  shape.quadraticCurveTo(0.42, -0.05, 0.42, 0.02);
  shape.lineTo(0.42, 0.08);
  shape.quadraticCurveTo(0.42, 0.14, 0.35, 0.14);
  shape.lineTo(-0.13, 0.14);
  shape.quadraticCurveTo(-0.2, 0.14, -0.2, 0.05);
  shape.quadraticCurveTo(-0.2, -0.05, -0.16, -0.05);
  const head = new T.Mesh(
    new T.ExtrudeGeometry(shape, {
      depth: 0.24,
      bevelEnabled: true,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      bevelSegments: 3,
      steps: 1,
    }),
    ceramic,
  );
  head.position.set(0, 0.1, -0.12);
  pump.add(head);
  const nozzle = new T.Mesh(
    new T.CylinderGeometry(0.034, 0.034, 0.04, 14),
    new T.MeshBasicMaterial({ color: 0x38271f }),
  );
  nozzle.rotation.z = Math.PI / 2;
  nozzle.position.set(0.43, 0.11, 0);
  pump.add(nozzle);
  print = new T.Mesh(
    new T.CylinderGeometry(0.568, 0.568, 1.31, 40, 1, true, -0.64, 1.28),
    new T.MeshBasicMaterial({ map: label(), toneMapped: false }),
  );
  print.position.y = -0.04;
  bottle.add(print);
  const base = new T.Mesh(new T.TorusGeometry(0.48, 0.025, 8, 64), metal);
  base.rotation.x = Math.PI / 2;
  base.position.y = -1.23;
  bottle.add(base);
  pearls = new T.InstancedMesh(
    new T.SphereGeometry(0.095, 16, 12),
    new T.MeshStandardMaterial({
      color: 0xe4cbae,
      metalness: 0.65,
      roughness: 0.15,
      envMapIntensity: 1.7,
    }),
    30,
  );
  scene.add(pearls);
  const curve = new T.CatmullRomCurve3(
    Array.from({ length: 90 }, (_, i) => {
      const a = (i / 89) * Math.PI * 3;
      return new T.Vector3(
        Math.cos(a) * 0.82,
        (i / 89 - 0.5) * 2.4,
        Math.sin(a) * 0.82,
      );
    }),
  );
  ribbon = new T.Mesh(new T.TubeGeometry(curve, 100, 0.014, 5, false), metal);
  bottle.add(ribbon);
  document.body.classList.add("webgl");
  control = createRenderControl({
    renderer,
    canvas,
    story,
    onResize(w, h) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    },
    paint,
  });
}
const temp = new T.Object3D();
function paint() {
  const mobile = innerWidth < 701,
    i = Math.min(2, Math.floor(progress)),
    f = ease(progress - i),
    a = poses[i],
    b = poses[i + 1];
  const spread = Math.sin(clamp(progress / 2) * Math.PI);
  bottle.position.set(mix(a.x, b.x, f), mix(a.y, b.y, f), 0);
  bottle.scale.setScalar(mix(a.s, b.s, f));
  bottle.rotation.set(
    0.06,
    mix(a.ry, b.ry, f) + (reduced.matches ? 0 : px * 0.07),
    mix(a.rz, b.rz, f),
  );
  if (mobile) {
    bottle.position.set(0.32, -1.35, 0);
    bottle.scale.setScalar(0.8);
    bottle.rotation.set(0.02, -0.24, -0.08);
  }
  if (reduced.matches) {
    bottle.rotation.set(0, -0.16, 0);
    if (!mobile) {
      bottle.position.set(1.65, 0, 0);
      bottle.scale.setScalar(1.3);
    }
  }
  body.color.set(colours[variant] || colours.calm);
  pump.position.y = 1.43 + (reduced.matches ? 0 : spread * 0.62);
  ribbon.visible = !reduced.matches && spread > 0.01;
  ribbon.rotation.y = progress * 0.8;
  ribbon.scale.setScalar(0.7 + spread * 0.55);
  for (let n = 0; n < 30; n++) {
    const ang = n * 0.59 + progress * 1.2,
      r = 0.55 + spread * (0.65 + (n % 3) * 0.14);
    temp.position.set(
      bottle.position.x + Math.sin(ang) * r * (mobile ? 0.7 : 1),
      bottle.position.y + (n / 29 - 0.5) * 2.8,
      bottle.position.z + Math.cos(ang) * r,
    );
    temp.scale.setScalar(reduced.matches ? 0 : spread * (mobile ? 0.55 : 1));
    temp.updateMatrix();
    pearls.setMatrixAt(n, temp.matrix);
  }
  pearls.instanceMatrix.needsUpdate = true;
  camera.position.set(reduced.matches ? 0 : px * 0.04, 0.1, 10);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}
function scroll() {
  progress =
    clamp(
      -story.getBoundingClientRect().top / (story.offsetHeight - innerHeight),
    ) * 3;
  document.querySelector("#story-progress").style.width =
    `${(progress / 3) * 100}%`;
  document.querySelector("#chapter-count").textContent =
    `0${Math.min(4, Math.floor(progress) + 1)} / 04`;
  document
    .querySelector(".scene")
    .style.setProperty(
      "--reveal",
      String(Math.sin((progress / 3) * Math.PI) * 0.13),
    );
  control?.invalidate();
}
addEventListener("scroll", scroll, { passive: true });
addEventListener(
  "pointermove",
  (e) => {
    if (reduced.matches) return;
    px = e.clientX / innerWidth - 0.5;
    control?.invalidate();
  },
  { passive: true },
);
reduced.addEventListener("change", () => control?.invalidate());
canvas.addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  control?.dispose();
  canvas.hidden = true;
  document.body.classList.remove("webgl");
});
Promise.all([
  document.fonts.load("100px Instrument"),
  document.fonts.load("30px DM"),
])
  .catch(() => {})
  .then(() => {
    try {
      build();
      scroll();
    } catch (e) {
      canvas.hidden = true;
      document.body.classList.remove("webgl");
      document.documentElement.dataset.renderMode = "fallback";
      console.warn("Using the static product illustration.", e.message);
    }
  });
