"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import useScrollStory from "@/components/three/useScrollStory";
import HoloAiCore from "@/components/three/HoloAiCore";
import CircuitBoardBackgroundTexture from "@/components/three/CircuitBoardBackgroundTexture";

export type LuxSceneVariant = "home" | "coding";

function CameraRig({
  mouse,
  scrollProgressRef,
}: {
  mouse: MutableRefObject<THREE.Vector2>;
  scrollProgressRef: MutableRefObject<number>;
}) {
  const { camera } = useThree();

  useFrame(() => {
    const sp = scrollProgressRef.current;
    const m = mouse.current;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, m.x * 0.55, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.1 - sp * 0.28 + m.y * 0.08, 0.04);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 6.2 - sp * 1.35, 0.03);
    camera.lookAt(0, sp * -0.18, 0);
  });

  return null;
}

function SceneInner({ variant }: { variant: LuxSceneVariant }) {
  const mouse = useRef(new THREE.Vector2(0, 0));
  const scrollProgressRef = useRef(0);

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  // Mouse parallax target (normalized)
  const onPointerMove = (e: any) => {
    const { clientX, clientY } = e;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = (clientX / w) * 2 - 1;
    const y = -(clientY / h) * 2 + 1;
    mouse.current.set(clamp(x, -1, 1), clamp(y, -1, 1));
  };

  useScrollStory(scrollProgressRef);

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.2, 6.2], fov: 38 }}
      onPointerMove={onPointerMove}
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none" }}
    >
      <color attach="background" args={["#06050b"]} />
      <fog attach="fog" args={["#06050b", 7.5, 14]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 4, 3]} intensity={2.4} />
      <pointLight position={[-3, -2, 2]} intensity={1.2} />
      <CircuitBoardBackgroundTexture mouse={mouse} />
      <CameraRig mouse={mouse} scrollProgressRef={scrollProgressRef} />
      <HoloAiCore variant={variant} mouse={mouse} scrollProgressRef={scrollProgressRef} />
    </Canvas>
  );
}

export default function LuxScene({ variant }: { variant: LuxSceneVariant }) {
  return <SceneInner variant={variant} />;
}

