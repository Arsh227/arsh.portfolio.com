"use client";

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import type { MutableRefObject } from "react";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";

export default function CircuitBoardBackgroundTexture({
  mouse,
}: {
  mouse: MutableRefObject<THREE.Vector2>;
}) {
  const { viewport } = useThree();

  const circuitTexture = useLoader(TextureLoader, "/assets/ai-circuit.png");

  const layers = useMemo(() => {
    // Tile so it feels like a motherboard, not a single repeated image.
    circuitTexture.wrapS = THREE.RepeatWrapping;
    circuitTexture.wrapT = THREE.RepeatWrapping;
    circuitTexture.repeat.set(6, 10);
    circuitTexture.center.set(0.5, 0.5);

    // Base navy/black layer.
    const baseColor = new THREE.Color("#03020a");

    return { baseColor };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const glowMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const m = mouse.current;

    // Subtle parallax + drifting to avoid “static image” feel.
    const texOffsetX = 0.02 * Math.sin(t * 0.06) + m.x * 0.02;
    const texOffsetY = 0.02 * Math.cos(t * 0.05) - m.y * 0.02;
    circuitTexture.offset.x = texOffsetX;
    circuitTexture.offset.y = texOffsetY;

    if (glowMatRef.current) {
      const pulse = 0.9 + 0.25 * Math.sin(t * 0.7 + m.x * 2.0);
      glowMatRef.current.emissiveIntensity = 0.75 * pulse;
      glowMatRef.current.opacity = 0.11 + 0.025 * pulse;
    }
  });

  return (
    <group>
      {/* Deep base */}
      <mesh position={[0, 0, -8]}>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshBasicMaterial color={layers.baseColor} transparent opacity={1} />
      </mesh>

      {/* Neon PCB overlay */}
      <mesh position={[0, 0, -7.8]}>
        <planeGeometry args={[viewport.width, viewport.height]} />
        <meshStandardMaterial
          ref={glowMatRef}
          map={circuitTexture}
          emissive={new THREE.Color("#0af3ff")}
          emissiveMap={circuitTexture}
          emissiveIntensity={0.7}
          opacity={0.12}
          transparent
          metalness={0.15}
          roughness={0.75}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

