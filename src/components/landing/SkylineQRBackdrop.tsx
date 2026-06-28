"use client";

import { useEffect, useRef } from "react";
import type { Building as CityBuilding } from "@/lib/preview/cityPresets";
import { generateSFSkyline } from "@/lib/preview/sfSkyline";
import { generateQRMatrixSync } from "@/lib/preview/qrMatrix";

const SF_BUILDINGS = generateSFSkyline();

const CAM = { x: 42, y: 52, z: 58 };
const TARGET = { x: 0, y: 8, z: -12 };

type Vec3 = { x: number; y: number; z: number };
type Projected = { sx: number; sy: number; scale: number; depth: number };

type CameraState = {
  yaw: number;
  pitch: number;
  distance: number;
  target: Vec3;
};

type CameraBasis = {
  pos: Vec3;
  fwd: Vec3;
  right: Vec3;
  up: Vec3;
};

const INIT_OFFSET = {
  x: CAM.x - TARGET.x,
  y: CAM.y - TARGET.y,
  z: CAM.z - TARGET.z,
};
const INIT_DISTANCE = Math.hypot(INIT_OFFSET.x, INIT_OFFSET.y, INIT_OFFSET.z);
const INIT_CAMERA: CameraState = {
  yaw: Math.atan2(INIT_OFFSET.x, INIT_OFFSET.z) + 0.14,
  pitch: Math.asin(INIT_OFFSET.y / INIT_DISTANCE) + 0.1,
  distance: INIT_DISTANCE * 0.96,
  target: { x: -1, y: 5, z: -10 },
};

const SKY_ANCHOR = { x: 40, y: 36, z: -8 };
const QR_DISPLAY_SCALE = 0.5;
const TARGET_WORLD = { x: 2, y: 0, z: -12 };
const QR_URL = "https://adastra.com";
const QR_MATRIX = generateQRMatrixSync(QR_URL, 21);

function skyAnchor(): Vec3 {
  return { ...SKY_ANCHOR };
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function normalize(v: Vec3): Vec3 {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function computeBasis(cam: CameraState): CameraBasis {
  const cp = Math.cos(cam.pitch);
  const sp = Math.sin(cam.pitch);
  const cy = Math.cos(cam.yaw);
  const sy = Math.sin(cam.yaw);

  const offset: Vec3 = {
    x: cam.distance * cp * sy,
    y: cam.distance * sp,
    z: cam.distance * cp * cy,
  };

  const pos = add(cam.target, offset);
  const fwd = normalize(sub(cam.target, pos));
  const right = normalize(cross(fwd, { x: 0, y: 1, z: 0 }));
  const up = cross(right, fwd);

  return { pos, fwd, right, up };
}

function seeded(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const DRONE_PATHS = Array.from({ length: 14 }, (_, i) => ({
  phase: i * 0.55,
  fromX: -18 + seeded(i * 19) * 36,
  fromZ: -14 + seeded(i * 23 + 4) * 28,
  speed: 0.42 + seeded(i * 7) * 0.22,
}));

function projectWorld(
  wx: number,
  wy: number,
  wz: number,
  w: number,
  h: number,
  basis: CameraBasis,
): Projected | null {
  const rel = sub({ x: wx, y: wy, z: wz }, basis.pos);
  const vx = dot(rel, basis.right);
  const vy = dot(rel, basis.up);
  const vz = dot(rel, basis.fwd);

  if (vz < 1) return null;

  const focal = h * 1.08;
  const sx = w * 0.5 + (vx / vz) * focal;
  const sy = h * 0.52 - (vy / vz) * focal;

  return { sx, sy, scale: 1 / vz, depth: vz };
}

function drawGround(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  basis: CameraBasis,
) {
  const corners = [
    projectWorld(-42, 0, -32, w, h, basis),
    projectWorld(42, 0, -32, w, h, basis),
    projectWorld(42, 0, 30, w, h, basis),
    projectWorld(-42, 0, 30, w, h, basis),
  ];

  if (corners.some((c) => !c)) return;

  const pts = corners as Projected[];
  const horizonY = Math.min(...pts.map((p) => p.sy));

  const grad = ctx.createLinearGradient(0, horizonY * 0.6, 0, h);
  grad.addColorStop(0, "rgba(210, 206, 195, 0.22)");
  grad.addColorStop(0.5, "rgba(11, 11, 11, 0.035)");
  grad.addColorStop(1, "rgba(11, 11, 11, 0.06)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, Math.max(0, horizonY));
  ctx.lineTo(w, Math.max(0, horizonY));
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(210, 206, 195, 0.12)";
  ctx.beginPath();
  ctx.moveTo(pts[0].sx, pts[0].sy);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].sx, pts[i].sy);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(11, 11, 11, 0.04)";
  ctx.lineWidth = 0.5;

  for (let gx = -30; gx <= 30; gx += 5) {
    const a = projectWorld(gx * 1.15, 0, -28, w, h, basis);
    const b = projectWorld(gx * 1.15, 0, 22, w, h, basis);
    if (!a || !b) continue;
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    ctx.stroke();
  }

  for (let gz = -24; gz <= 20; gz += 4) {
    const a = projectWorld(-34, 0, gz * 1.15, w, h, basis);
    const b = projectWorld(34, 0, gz * 1.15, w, h, basis);
    if (!a || !b) continue;
    ctx.beginPath();
    ctx.moveTo(a.sx, a.sy);
    ctx.lineTo(b.sx, b.sy);
    ctx.stroke();
  }
}

function drawExtrudedBlock(
  ctx: CanvasRenderingContext2D,
  b: CityBuilding,
  w: number,
  h: number,
  basis: CameraBasis,
  t: number,
) {
  const hw = b.width / 2;
  const hd = b.depth / 2;
  const seed = Math.abs(Math.floor(b.x * 13 + b.z * 7));

  const footprint = [
    { x: b.x - hw, z: b.z - hd },
    { x: b.x + hw, z: b.z - hd },
    { x: b.x + hw, z: b.z + hd },
    { x: b.x - hw, z: b.z + hd },
  ];

  const base = footprint
    .map((c) => projectWorld(c.x, 0, c.z, w, h, basis))
    .filter(Boolean) as Projected[];
  const top = footprint
    .map((c) => projectWorld(c.x, b.height, c.z, w, h, basis))
    .filter(Boolean) as Projected[];

  if (base.length < 4 || top.length < 4) return;

  const isPyramid = b.style === "pyramid";
  const apex = projectWorld(b.x, b.height, b.z, w, h, basis);

  const topFill = `rgba(228, 222, 210, ${0.58 + seeded(seed) * 0.14})`;
  const sideFill = `rgba(52, 50, 56, ${0.52 + seeded(seed + 1) * 0.12})`;
  const frontFill = `rgba(88, 84, 92, ${0.62 + seeded(seed + 2) * 0.1})`;

  if (isPyramid && apex) {
    ctx.fillStyle = sideFill;
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      ctx.beginPath();
      ctx.moveTo(base[i].sx, base[i].sy);
      ctx.lineTo(base[j].sx, base[j].sy);
      ctx.lineTo(apex.sx, apex.sy);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = topFill;
    ctx.beginPath();
    ctx.moveTo(base[0].sx, base[0].sy);
    for (let i = 1; i < 4; i++) ctx.lineTo(base[i].sx, base[i].sy);
    ctx.closePath();
    ctx.fill();
    return;
  }

  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    ctx.fillStyle = i % 2 === 0 ? sideFill : frontFill;
    ctx.beginPath();
    ctx.moveTo(base[i].sx, base[i].sy);
    ctx.lineTo(base[j].sx, base[j].sy);
    ctx.lineTo(top[j].sx, top[j].sy);
    ctx.lineTo(top[i].sx, top[i].sy);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = topFill;
  ctx.beginPath();
  ctx.moveTo(top[0].sx, top[0].sy);
  for (let i = 1; i < 4; i++) ctx.lineTo(top[i].sx, top[i].sy);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(11, 11, 11, 0.18)";
  ctx.lineWidth = 0.4;
  ctx.stroke();

  const minX = Math.min(...top.map((p) => p.sx));
  const maxX = Math.max(...top.map((p) => p.sx));
  const minY = Math.min(...top.map((p) => p.sy));
  const maxY = Math.max(...base.map((p) => p.sy));
  const bw = maxX - minX;
  const bh = maxY - minY;

  if (bh > 6 && bw > 4) {
    const rows = Math.max(2, Math.floor(bh / 10));
    const cols = Math.max(2, Math.floor(bw / 8));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (seeded(seed + r * 3 + c) < 0.45) continue;
        const wx = minX + bw * 0.1 + c * (bw * 0.8 / cols);
        const wy = minY + bh * 0.1 + r * (bh * 0.8 / rows);
        const glow = 0.25 + Math.sin(t * 1.4 + seed + r + c) * 0.2;
        ctx.fillStyle = `rgba(238, 75, 30, ${glow * 0.58})`;
        ctx.fillRect(wx, wy, 1.5, 2);
      }
    }
  }
}

function drawCity(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  basis: CameraBasis,
  t: number,
) {
  drawGround(ctx, w, h, basis);

  const sorted = [...SF_BUILDINGS].sort((a, b) => {
    const da = projectWorld(a.x, a.height * 0.5, a.z, w, h, basis)?.depth ?? 0;
    const db = projectWorld(b.x, b.height * 0.5, b.z, w, h, basis)?.depth ?? 0;
    return db - da;
  });

  for (const b of sorted) {
    drawExtrudedBlock(ctx, b, w, h, basis, t);
  }
}

function drawTargetZone(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  basis: CameraBasis,
  t: number,
) {
  const pulse = 0.5 + Math.sin(t * 1.6) * 0.5;
  const ringSteps = 24;

  for (let r = 0; r < 3; r++) {
    const radius = 2.2 + r * 1.4 + pulse * 0.6;
    ctx.strokeStyle = `rgba(238, 75, 30, ${(0.22 - r * 0.05) * pulse})`;
    ctx.lineWidth = 1.2 - r * 0.25;
    ctx.beginPath();
    for (let i = 0; i <= ringSteps; i++) {
      const a = (i / ringSteps) * Math.PI * 2;
      const p = projectWorld(
        TARGET_WORLD.x + Math.cos(a) * radius,
        0.2,
        TARGET_WORLD.z + Math.sin(a) * radius,
        w,
        h,
        basis,
      );
      if (!p) continue;
      if (i === 0) ctx.moveTo(p.sx, p.sy);
      else ctx.lineTo(p.sx, p.sy);
    }
    ctx.closePath();
    ctx.stroke();
  }

  const center = projectWorld(TARGET_WORLD.x, 0.2, TARGET_WORLD.z, w, h, basis);
  if (!center) return;
  ctx.fillStyle = `rgba(238, 75, 30, ${0.35 * pulse})`;
  ctx.beginPath();
  ctx.arc(center.sx, center.sy, 3 + pulse * 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawScanBeam(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  basis: CameraBasis,
  qrPos: Vec3,
  t: number,
) {
  const top = projectWorld(qrPos.x, qrPos.y, qrPos.z, w, h, basis);
  const bottom = projectWorld(TARGET_WORLD.x, 0, TARGET_WORLD.z, w, h, basis);
  if (!top || !bottom) return;

  const beamGrad = ctx.createLinearGradient(top.sx, top.sy, bottom.sx, bottom.sy);
  beamGrad.addColorStop(0, `rgba(34, 211, 238, ${0.18 + Math.sin(t * 2) * 0.06})`);
  beamGrad.addColorStop(0.5, "rgba(238, 75, 30, 0.08)");
  beamGrad.addColorStop(1, "rgba(238, 75, 30, 0.02)");

  ctx.strokeStyle = beamGrad;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 8]);
  ctx.beginPath();
  ctx.moveTo(top.sx, top.sy);
  ctx.lineTo(bottom.sx, bottom.sy);
  ctx.stroke();
  ctx.setLineDash([]);

  const spread = 4 + Math.sin(t * 1.2) * 1.5;
  for (const side of [-1, 1]) {
    const edge = projectWorld(
      qrPos.x + side * spread,
      qrPos.y * 0.55,
      qrPos.z,
      w,
      h,
      basis,
    );
    if (!edge) continue;
    ctx.strokeStyle = "rgba(34, 211, 238, 0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(edge.sx, edge.sy);
    ctx.lineTo(bottom.sx, bottom.sy);
    ctx.stroke();
  }
}

function drawDroneSwarm(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  basis: CameraBasis,
  qrPos: Vec3,
  t: number,
) {
  for (const d of DRONE_PATHS) {
    const cycle = (t * d.speed + d.phase) % 1;
    const ease = cycle < 0.5 ? cycle * 2 : 2 - cycle * 2;
    const wx = d.fromX + (qrPos.x - d.fromX) * ease;
    const wy = 6 + ease * (qrPos.y - 10) + Math.sin(t * 2.8 + d.phase) * 1.5;
    const wz = d.fromZ + (qrPos.z - d.fromZ) * ease;
    const p = projectWorld(wx, wy, wz, w, h, basis);
    if (!p) continue;

    const trail = projectWorld(
      wx + (d.fromX - qrPos.x) * 0.06,
      wy - 2,
      wz + (d.fromZ - qrPos.z) * 0.06,
      w,
      h,
      basis,
    );

    if (trail) {
      ctx.strokeStyle = `rgba(34, 211, 238, ${0.12 * ease})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(trail.sx, trail.sy);
      ctx.lineTo(p.sx, p.sy);
      ctx.stroke();
    }

    const glow = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, 4);
    glow.addColorStop(0, `rgba(255, 200, 120, ${0.7 * ease})`);
    glow.addColorStop(1, "rgba(238, 75, 30, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(238, 75, 30, ${0.55 + ease * 0.4})`;
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

const QR_PALETTE = [
  { r: 238, g: 75, b: 30 },
  { r: 255, g: 90, b: 40 },
  { r: 34, g: 211, b: 238 },
  { r: 56, g: 189, b: 248 },
  { r: 251, g: 146, b: 60 },
  { r: 167, g: 139, b: 250 },
];

function qrModuleColor(row: number, col: number, t: number, phase: number) {
  const c = QR_PALETTE[(row * 3 + col * 5) % QR_PALETTE.length];
  const pulse = 0.88 + Math.sin(t * 2.4 + phase) * 0.12;
  return { r: c.r, g: c.g, b: c.b, a: pulse };
}

function drawLegibleLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fill: string,
) {
  ctx.strokeStyle = "rgba(241, 239, 233, 0.95)";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

function drawSceneLabels(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  basis: CameraBasis,
  qrPos: Vec3,
  t: number,
) {
  const qrScreen = projectWorld(qrPos.x, qrPos.y + 4, qrPos.z, w, h, basis);
  if (!qrScreen) return;

  ctx.font = "600 9px var(--font-michroma), monospace";
  ctx.textAlign = "left";
  drawLegibleLabel(
    ctx,
    "SWARM · 462 DRONES",
    qrScreen.sx + 12,
    qrScreen.sy - 6,
    "rgba(11, 11, 11, 0.9)",
  );
  drawLegibleLabel(
    ctx,
    "180M ALTITUDE",
    qrScreen.sx + 12,
    qrScreen.sy + 8,
    "rgba(238, 75, 30, 0.95)",
  );

}

function drawQRFormation(
  ctx: CanvasRenderingContext2D,
  matrix: boolean[][],
  w: number,
  h: number,
  t: number,
  basis: CameraBasis,
  qrPos: Vec3,
) {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  if (rows === 0) return null;

  const center = projectWorld(qrPos.x, qrPos.y, qrPos.z, w, h, basis);
  if (!center) return null;

  const planeHalf = 2.5;
  const rightPt = projectWorld(
    qrPos.x + basis.right.x * planeHalf,
    qrPos.y + basis.right.y * planeHalf,
    qrPos.z + basis.right.z * planeHalf,
    w,
    h,
    basis,
  );
  const upPt = projectWorld(
    qrPos.x + basis.up.x * planeHalf,
    qrPos.y + basis.up.y * planeHalf,
    qrPos.z + basis.up.z * planeHalf,
    w,
    h,
    basis,
  );
  if (!rightPt || !upPt) return null;

  const moduleSize = 0.58;
  const qrSize = cols * moduleSize;
  const quiet = moduleSize * 1.6;
  const total = qrSize + quiet * 2;
  const half = total / 2;
  const inner = half - quiet;

  const rx = (rightPt.sx - center.sx) / planeHalf;
  const ry = (rightPt.sy - center.sy) / planeHalf;
  const ux = (upPt.sx - center.sx) / planeHalf;
  const uy = (upPt.sy - center.sy) / planeHalf;

  ctx.save();
  ctx.translate(center.sx, center.sy);
  ctx.transform(rx, ry, ux, uy, 0, 0);
  ctx.scale(QR_DISPLAY_SCALE, QR_DISPLAY_SCALE);

  const halo = ctx.createRadialGradient(0, 0, total * 0.1, 0, 0, total * 0.95);
  halo.addColorStop(0, "rgba(34, 211, 238, 0.32)");
  halo.addColorStop(0.45, "rgba(238, 75, 30, 0.22)");
  halo.addColorStop(1, "rgba(238, 75, 30, 0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, total * 0.95, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = "rgba(34, 211, 238, 0.45)";
  ctx.shadowBlur = 22;
  const panelGrad = ctx.createLinearGradient(-half, -half, half, half);
  panelGrad.addColorStop(0, "rgba(18, 22, 32, 0.82)");
  panelGrad.addColorStop(0.5, "rgba(12, 14, 22, 0.88)");
  panelGrad.addColorStop(1, "rgba(24, 18, 28, 0.84)");
  ctx.fillStyle = panelGrad;
  ctx.beginPath();
  ctx.roundRect(-half, -half, total, total, moduleSize * 0.45);
  ctx.fill();
  ctx.shadowBlur = 0;

  const borderGrad = ctx.createLinearGradient(-half, -half, half, half);
  borderGrad.addColorStop(0, "rgba(34, 211, 238, 0.75)");
  borderGrad.addColorStop(0.5, "rgba(238, 75, 30, 0.8)");
  borderGrad.addColorStop(1, "rgba(167, 139, 250, 0.7)");
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 0.1;
  ctx.beginPath();
  ctx.roundRect(-half, -half, total, total, moduleSize * 0.45);
  ctx.stroke();

  ctx.fillStyle = "rgba(8, 10, 18, 0.55)";
  ctx.fillRect(-inner, -inner, qrSize, qrSize);

  const isActive = (row: number, col: number) =>
    row >= 0 && row < rows && col >= 0 && col < cols && matrix[row][col];

  const toLocal = (row: number, col: number) => ({
    x: (col - cols / 2) * moduleSize + moduleSize / 2,
    y: (row - rows / 2) * moduleSize + moduleSize / 2,
  });

  ctx.lineWidth = 0.25;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!matrix[row][col]) continue;
      const from = toLocal(row, col);
      const links = [
        [row, col + 1],
        [row + 1, col],
        [row + 1, col + 1],
      ] as const;
      for (const [nr, nc] of links) {
        if (!isActive(nr, nc)) continue;
        const to = toLocal(nr, nc);
        const phase = (row + col + nr + nc) * 0.3;
        const { r, g, b, a } = qrModuleColor(row, col, t, phase);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a * 0.72})`;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    }
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!matrix[row][col]) continue;
      const { x: px, y: py } = toLocal(row, col);
      const phase = (row + col) * 0.42;
      const { r, g, b, a } = qrModuleColor(row, col, t, phase);
      const star = moduleSize * 0.09;

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a * 0.88})`;
      ctx.beginPath();
      ctx.arc(px, py, star * 2.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, a * 1.2)})`;
      ctx.fillRect(px - star * 0.35, py - star * 0.08, star * 0.7, star * 0.16);
      ctx.fillRect(px - star * 0.08, py - star * 0.35, star * 0.16, star * 0.7);
    }
  }

  ctx.strokeStyle = "rgba(34, 211, 238, 0.35)";
  ctx.lineWidth = 0.08;
  ctx.strokeRect(-inner, -inner, qrSize, qrSize);

  ctx.restore();
  return { pos: qrPos, screen: center };
}

export function SkylineQRBackdrop({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const matrixRef = useRef<boolean[][]>(QR_MATRIX);
  const cameraRef = useRef<CameraState>({ ...INIT_CAMERA, target: { ...INIT_CAMERA.target } });
  const draggingRef = useRef(false);
  const panningRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const idleRef = useRef(0);
  const autoYawRef = useRef(INIT_CAMERA.yaw);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const markActive = () => {
      idleRef.current = performance.now();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button > 0 && e.button !== 1) return;
      draggingRef.current = true;
      panningRef.current = e.button === 1 || e.shiftKey;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
      markActive();
      e.preventDefault();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };

      const cam = cameraRef.current;

      if (panningRef.current) {
        const basis = computeBasis(cam);
        const panScale = cam.distance * 0.0016;
        cam.target = add(
          cam.target,
          add(scale(basis.right, -dx * panScale), scale(basis.fwd, dy * panScale * 0.7)),
        );
      } else {
        cam.yaw += dx * 0.004;
        cam.pitch = Math.max(0.18, Math.min(1.32, cam.pitch + dy * 0.003));
      }

      autoYawRef.current = cam.yaw;
      markActive();
    };

    const endDrag = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      panningRef.current = false;
      canvas.releasePointerCapture(e.pointerId);
      canvas.style.cursor = "grab";
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cam = cameraRef.current;
      cam.distance = Math.max(
        38,
        Math.min(130, cam.distance * (1 + e.deltaY * 0.0012)),
      );
      markActive();
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    const start = performance.now();

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.5);
      skyGrad.addColorStop(0, "rgba(197, 210, 220, 0.12)");
      skyGrad.addColorStop(0.45, "rgba(241, 239, 233, 0.04)");
      skyGrad.addColorStop(1, "rgba(241, 239, 233, 0)");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      const cam = cameraRef.current;
      const idleFor = (now - idleRef.current) / 1000;

      if (!draggingRef.current) {
        autoYawRef.current += 0.0016;
        cam.yaw = autoYawRef.current;
        if (idleFor > 2) {
          cam.pitch =
            INIT_CAMERA.pitch + Math.sin(t * 0.18) * 0.035;
        }
      } else {
        autoYawRef.current = cam.yaw;
      }

      const basis = computeBasis(cam);
      drawCity(ctx, width, height, basis, t);
      drawTargetZone(ctx, width, height, basis, t);

      const skyPos = skyAnchor();

      drawScanBeam(ctx, width, height, basis, skyPos, t);
      drawDroneSwarm(ctx, width, height, basis, skyPos, t);
      drawQRFormation(ctx, matrixRef.current, width, height, t, basis, skyPos);
      drawSceneLabels(ctx, width, height, basis, skyPos, t);

      frame = requestAnimationFrame(draw);
    };

    idleRef.current = performance.now();
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", endDrag);
      canvas.removeEventListener("pointercancel", endDrag);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-label="3D city preview"
      className={`touch-none select-none ${className}`}
    />
  );
}