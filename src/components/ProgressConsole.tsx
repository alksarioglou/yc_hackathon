"use client";

import { useEffect, useRef, useState } from "react";
import { CorridorBackdrop } from "./CorridorBackdrop";

// A black "monolith" readout: HAL-style orange eye, the corridor drifting
// behind, and thinking lines revealed one at a time on a timer.
export function ProgressConsole({
  title,
  lines,
  done,
  onComplete,
}: {
  title: string;
  lines: string[];
  done: boolean;
  /** Fired once after every line has been revealed. */
  onComplete?: () => void;
}) {
  const [visible, setVisible] = useState(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completed = useRef(false);

  useEffect(() => {
    if (visible >= lines.length) return;
    const remaining = lines.length - visible;
    const delay = remaining <= 1 ? 1600 : 850;
    timer.current = setTimeout(() => setVisible((v) => v + 1), delay);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [visible, lines.length]);

  useEffect(() => {
    if (visible < lines.length || !onComplete || completed.current) return;
    completed.current = true;
    const finish = setTimeout(onComplete, 500);
    return () => clearTimeout(finish);
  }, [visible, lines.length, onComplete]);

  const shown = lines.slice(0, visible);

  return (
    <div className="animate-fade-in-up relative w-full overflow-hidden rounded-sm border border-ink bg-ink text-paper">
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <CorridorBackdrop animate className="h-full w-full" />
      </div>

      <div className="relative p-7 sm:p-9">
        <div className="mb-7 flex items-center gap-3">
          <span className="eye-pulse h-3 w-3 rounded-full bg-orange" />
          <span className="label text-paper/70">{title}</span>
        </div>

        <div className="space-y-3 font-mono text-sm">
          {shown.map((line, i) => {
            const isLast = i === shown.length - 1;
            const atEnd = visible >= lines.length;
            const pending = isLast && !done && atEnd;
            const settled = !isLast || (atEnd && !pending) || (!atEnd && !isLast);
            return (
              <div key={i} className="animate-fade-in flex items-start gap-3">
                <span className={settled ? "text-orange" : "text-paper/40"}>
                  {pending ? "▸" : settled ? "✓" : "▸"}
                </span>
                <span className={settled ? "text-paper/70" : "text-paper"}>
                  {line}
                  {isLast && !done && (
                    <span className="cursor-blink ml-1 text-orange">▋</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
