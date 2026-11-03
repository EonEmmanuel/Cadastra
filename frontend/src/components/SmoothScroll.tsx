"use client";

import { useEffect } from "react";
import Lenis from "lenis";

interface SmoothScrollProps {
  enabled?: boolean;
}

export default function SmoothScroll({ enabled = true }: SmoothScrollProps) {
  useEffect(() => {
    if (!enabled) return;

    // Initialize Lenis with cinematic exponential momentum easing
    const lenis = new Lenis({
      duration: 0.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 2.0,
      infinite: false,
    });

    let animationFrameId: number;

    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, [enabled]);

  return null;
}
