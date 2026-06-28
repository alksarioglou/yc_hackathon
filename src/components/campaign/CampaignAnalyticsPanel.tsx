"use client";

import { useEffect, useMemo, useState } from "react";
import { LopusAttribution } from "@/components/campaign/LopusAttribution";

const GLASS =
  "border-l border-white/15 bg-[#0c1018]/95 shadow-[-20px_0_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl";

const SCAN_SERIES = [0, 3, 11, 28, 52, 89, 134, 178, 224, 268, 312, 348];
const HOURLY_BARS = [12, 28, 45, 62, 88, 100, 94, 76, 58, 41, 22, 14];

const TIPS = [
  "Golden hour (17:30–18:30) lifted scan rate 2.1× — schedule the next flight in that window.",
  "Tighter QR spacing at 160m altitude improved readability from street level.",
  "Leads within 400m of the formation converted 3× more than the city average.",
];

function useAnimatedValue(target: number, active: boolean, durationMs = 2800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, durationMs]);

  return value;
}

function LineChart({
  data,
  active,
  width = 280,
  height = 100,
}: {
  data: number[];
  active: boolean;
  width?: number;
  height?: number;
}) {
  const padding = { top: 8, right: 8, bottom: 20, left: 8 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const max = Math.max(...data, 1);

  const points = data.map((v, i) => {
    const x = padding.left + (i / (data.length - 1)) * innerW;
    const y = padding.top + innerH - (v / max) * innerH;
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(" L ")}`;
  const areaPath = `${linePath} L ${padding.left + innerW},${padding.top + innerH} L ${padding.left},${padding.top + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" aria-hidden>
      <defs>
        <linearGradient id="scanArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ee4b1e" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ee4b1e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={padding.left}
          x2={padding.left + innerW}
          y1={padding.top + innerH * (1 - f)}
          y2={padding.top + innerH * (1 - f)}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}
      <path
        d={areaPath}
        fill="url(#scanArea)"
        className={`transition-opacity duration-1000 ${active ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDelay: "600ms" }}
      />
      <path
        d={linePath}
        fill="none"
        stroke="#ee4b1e"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="analytics-line-draw"
        style={{
          strokeDasharray: 1,
          strokeDashoffset: active ? 0 : 1,
          transition: "stroke-dashoffset 2.4s cubic-bezier(0.4, 0, 0.2, 1) 400ms",
        }}
      />
      {active &&
        data.map((v, i) => {
          const x = padding.left + (i / (data.length - 1)) * innerW;
          const y = padding.top + innerH - (v / max) * innerH;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2.5"
              fill="#ee4b1e"
              className="analytics-dot-pop"
              style={{ animationDelay: `${400 + i * 120}ms` }}
            />
          );
        })}
    </svg>
  );
}

function BarChart({ data, active }: { data: number[]; active: boolean }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-16 items-end gap-1">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 origin-bottom rounded-t-sm bg-gradient-to-t from-orange/80 to-orange/30"
          style={{
            height: active ? `${(v / max) * 100}%` : "0%",
            transition: `height 1.8s cubic-bezier(0.34, 1.2, 0.64, 1) ${300 + i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

export function CampaignAnalyticsPanel({
  open,
  city,
}: {
  open: boolean;
  city?: string;
}) {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setAnimating(true), 450);
      return () => clearTimeout(t);
    }
    setAnimating(false);
  }, [open]);

  const scans = useAnimatedValue(348, animating, 3000);
  const unique = useAnimatedValue(214, animating, 3200);
  const ctr = useAnimatedValue(62, animating, 2800);

  const conversionDisplay = useMemo(() => (ctr / 10).toFixed(1), [ctr]);

  return (
    <aside
      className={`pointer-events-auto fixed right-0 top-0 z-[55] flex h-full w-full max-w-[22rem] flex-col sm:max-w-md ${GLASS} ${
        open ? "analytics-panel-enter" : "analytics-panel-exit"
      }`}
      aria-hidden={!open}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-orange">
            Live performance
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-white">QR Campaign Analytics</h2>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-widest text-white/40">Total scans</p>
          <p className="mt-1 font-mono text-4xl font-light tabular-nums text-white">
            {scans.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-emerald-400/90">
            +{animating ? Math.min(24, Math.floor(scans / 14)) : 0}% vs. forecast
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/40">Unique viewers</p>
            <p className="mt-1 font-mono text-xl tabular-nums text-white">{unique}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] uppercase tracking-wider text-white/40">Scan-through</p>
            <p className="mt-1 font-mono text-xl tabular-nums text-white">{conversionDisplay}%</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/45">
              Scans over flight
            </p>
            <span className="text-[10px] text-white/30">10 min window</span>
          </div>
          <LineChart data={SCAN_SERIES} active={animating} />
        </div>

        <div className="mb-6">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/45">
            Hourly reach index
          </p>
          <BarChart data={HOURLY_BARS} active={animating} />
          <div className="mt-1.5 flex justify-between text-[9px] text-white/25">
            <span>6a</span>
            <span>12p</span>
            <span>6p</span>
            <span>12a</span>
          </div>
        </div>

        <div className="rounded-xl border border-orange/20 bg-orange/5 p-4">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-orange">
            Tips for next time
          </p>
          <ul className="space-y-3">
            {TIPS.map((tip, i) => (
              <li
                key={i}
                className={`flex gap-2.5 text-xs leading-relaxed text-white/70 ${
                  animating ? "analytics-tip-enter" : "opacity-0"
                }`}
                style={{ animationDelay: `${1200 + i * 350}ms` }}
              >
                <span className="mt-0.5 shrink-0 font-mono text-[10px] text-orange/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {city && (
          <p className="mt-4 text-center text-[10px] text-white/25">
            Cluster · {city}
          </p>
        )}
      </div>

      <div className="border-t border-white/10 px-5 py-4">
        <LopusAttribution variant="dark" />
      </div>
    </aside>
  );
}