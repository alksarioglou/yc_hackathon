"use client";

import { useEffect, useRef } from "react";

const SAMPLE_COUNT = 96;
const DRAW_DURATION = 22;
const LOOP_PAUSE = 5;
const BASE_LEADS = 412;
const PEAK_LEADS = 10_000_000;
const EXP_RATE = 4.5;
const EXP_DENOM = Math.exp(EXP_RATE) - 1;

function expValue(t: number) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return (Math.exp(EXP_RATE * t) - 1) / EXP_DENOM;
}

function smoothPath(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
) {
  if (points.length < 2) return;
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  ctx.quadraticCurveTo(prev.x, prev.y, last.x, last.y);
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function LeadsGrowthLine({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let cycleStart = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const layout = () => {
      const padL = Math.max(40, width * 0.06);
      const padR = Math.max(28, width * 0.04);
      const padB = 52;
      const padT = 56;
      const chartW = width - padL - padR;
      const baseY = height - padB;
      const topY = padT;
      const chartH = baseY - topY;
      return { padL, padR, topY, baseY, chartW, chartH };
    };

    const draw = (now: number) => {
      const elapsed = (now - cycleStart) / 1000;
      if (elapsed >= DRAW_DURATION + LOOP_PAUSE) {
        cycleStart = now;
      }

      const rawProgress =
        elapsed < DRAW_DURATION ? elapsed / DRAW_DURATION : 1;
      const fadeOut =
        elapsed > DRAW_DURATION
          ? 1 - Math.min(1, (elapsed - DRAW_DURATION) / LOOP_PAUSE)
          : 1;
      const drawProgress = easeOutCubic(rawProgress);

      ctx.clearRect(0, 0, width, height);

      const { padL, topY, baseY, chartW, chartH } = layout();
      const sampleCount = Math.max(
        2,
        Math.ceil(drawProgress * (SAMPLE_COUNT - 1)) + 1,
      );

      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < sampleCount; i++) {
        const t =
          i === sampleCount - 1
            ? drawProgress
            : (i / (SAMPLE_COUNT - 1)) * drawProgress;
        const x = padL + t * chartW;
        const y = topY + chartH * (1 - expValue(t));
        pts.push({ x, y });
      }

      if (pts.length < 2) {
        frame = requestAnimationFrame(draw);
        return;
      }

      const tip = pts[pts.length - 1];

      ctx.save();
      ctx.globalAlpha = fadeOut;

      ctx.beginPath();
      smoothPath(ctx, pts);
      ctx.lineTo(tip.x, baseY);
      ctx.lineTo(pts[0].x, baseY);
      ctx.closePath();

      const fillGrad = ctx.createLinearGradient(0, topY, 0, baseY);
      fillGrad.addColorStop(0, "rgba(238, 75, 30, 0.1)");
      fillGrad.addColorStop(0.45, "rgba(238, 75, 30, 0.05)");
      fillGrad.addColorStop(0.75, "rgba(34, 211, 238, 0.03)");
      fillGrad.addColorStop(1, "rgba(34, 211, 238, 0)");
      ctx.fillStyle = fillGrad;
      ctx.fill();

      ctx.shadowColor = "rgba(238, 75, 30, 0.45)";
      ctx.shadowBlur = 14;
      ctx.lineWidth = 2.25;
      const strokeGrad = ctx.createLinearGradient(padL, 0, padL + chartW, 0);
      strokeGrad.addColorStop(0, "rgba(238, 75, 30, 0.55)");
      strokeGrad.addColorStop(0.55, "rgba(238, 75, 30, 0.95)");
      strokeGrad.addColorStop(1, "rgba(34, 211, 238, 0.9)");
      ctx.strokeStyle = strokeGrad;
      ctx.beginPath();
      smoothPath(ctx, pts);
      ctx.stroke();
      ctx.shadowBlur = 0;

      const pulse = 0.65 + Math.sin(now * 0.004) * 0.35;

      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(238, 75, 30, ${0.22 * pulse})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * pulse})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(tip.x, tip.y, 1.1, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(238, 75, 30, 0.95)";
      ctx.fill();

      ctx.restore();

      const leads = Math.round(
        BASE_LEADS + (PEAK_LEADS - BASE_LEADS) * expValue(drawProgress),
      );
      if (countRef.current) {
        countRef.current.textContent = leads.toLocaleString();
      }

      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    cycleStart = performance.now();
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[5] pointer-events-none ${className}`}
      aria-hidden
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      <div className="absolute bottom-5 left-6 flex items-baseline gap-2 sm:left-10">
        <span className="label text-[0.55rem] text-ink/70">Leads</span>
        <span
          ref={countRef}
          className="font-[family-name:var(--font-michroma)] text-sm tabular-nums tracking-wide text-ink [text-shadow:0_0_12px_rgba(241,239,233,0.9)]"
        >
          {BASE_LEADS.toLocaleString()}
        </span>
      </div>
    </div>
  );
}