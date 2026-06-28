"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ViewPreset } from "./viewPreset";

const DELAY_MS = 10_000;

export function useFlowSpotlight(enabled: boolean) {
  const [spotlight, setSpotlight] = useState<ViewPreset | null>(null);
  const visitedRef = useRef({ overhead: false, scan: false });
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const startCycle = useCallback(() => {
    if (!enabledRef.current) return;
    clearTimers();
    setSpotlight(null);

    const add = (fn: () => void, ms: number) => {
      timersRef.current.push(setTimeout(fn, ms));
    };

    const runSpotlight = (target: ViewPreset) => {
      setSpotlight(target);
      add(() => setSpotlight(null), DELAY_MS);
    };

    add(() => {
      if (!enabledRef.current) return;
      if (!visitedRef.current.overhead) {
        runSpotlight("overhead");
        add(() => {
          if (!enabledRef.current) return;
          if (!visitedRef.current.scan) runSpotlight("qr");
        }, DELAY_MS * 2);
      } else if (!visitedRef.current.scan) {
        runSpotlight("qr");
      }
    }, DELAY_MS);
  }, [clearTimers]);

  const startCycleRef = useRef(startCycle);
  startCycleRef.current = startCycle;

  useEffect(() => {
    if (enabled) startCycleRef.current();
    return clearTimers;
  }, [enabled, clearTimers]);

  const onViewChange = useCallback((preset: ViewPreset) => {
    if (preset === "overhead") visitedRef.current.overhead = true;
    if (preset === "qr") visitedRef.current.scan = true;
    startCycleRef.current();
  }, []);

  return { spotlight, onViewChange };
}