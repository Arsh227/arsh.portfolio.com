"use client";

import { useEffect, useState } from "react";
import LuxScene from "@/components/three/LuxScene";
import type { LuxSceneVariant } from "@/components/three/LuxScene";

export default function LuxSceneGate({ variant }: { variant: LuxSceneVariant }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <LuxScene variant={variant} />;
}

