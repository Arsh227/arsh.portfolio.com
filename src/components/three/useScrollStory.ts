"use client";

import { useEffect } from "react";
import type { MutableRefObject } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

export default function useScrollStory(scrollProgressRef: MutableRefObject<number>) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    // Keep it simple: map entire page scroll to 0..1 progress.
    const trigger = document.body;

    const st = ScrollTrigger.create({
      trigger,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        scrollProgressRef.current = self.progress;
      },
    });

    return () => {
      st.kill();
    };
  }, [scrollProgressRef]);
}

