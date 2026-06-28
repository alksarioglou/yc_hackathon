"use client";

const SWARM = [
  { left: "12%", top: "18%", delay: "0s", duration: "14s", path: "drone-path-a" },
  { left: "78%", top: "14%", delay: "-3s", duration: "16s", path: "drone-path-b" },
  { left: "88%", top: "32%", delay: "-6s", duration: "12s", path: "drone-path-c" },
  { left: "6%", top: "38%", delay: "-2s", duration: "18s", path: "drone-path-d" },
  { left: "42%", top: "8%", delay: "-8s", duration: "15s", path: "drone-path-e" },
];

export function DroneSwarmOverlay({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {SWARM.map((d, i) => (
        <span
          key={i}
          className={`landing-drone absolute h-1.5 w-1.5 rounded-full bg-orange/50 shadow-[0_0_8px_rgba(238,75,30,0.5)] ${d.path}`}
          style={{
            left: d.left,
            top: d.top,
            animationDuration: d.duration,
            animationDelay: d.delay,
          }}
        />
      ))}
      <svg
        className="absolute right-[8%] top-[16%] h-[28%] w-[32%] opacity-[0.14]"
        viewBox="0 0 200 160"
        fill="none"
      >
        <path
          d="M 20 120 Q 60 40, 110 55 T 180 30"
          stroke="var(--orange)"
          strokeWidth="1"
          strokeDasharray="3 7"
          className="landing-drone-trail"
        />
        <path
          d="M 10 80 Q 70 100, 120 70 T 190 90"
          stroke="var(--orange)"
          strokeWidth="0.75"
          strokeDasharray="2 8"
          className="landing-drone-trail landing-drone-trail-delay"
        />
      </svg>
    </div>
  );
}