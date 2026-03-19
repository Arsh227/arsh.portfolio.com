"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { TextureLoader } from "three";

type LuxSceneVariant = "home" | "coding";

export default function HoloAiCore({
  variant,
  mouse,
  scrollProgressRef,
}: {
  variant: LuxSceneVariant;
  mouse: MutableRefObject<THREE.Vector2>;
  scrollProgressRef: MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const smoothPointsOpacity = useRef(0.55);
  const smoothLinesOpacity = useRef(0.14);
  const smoothSweepOpacity = useRef(0.08);

  // ==========================
  // Palette (tech hologram)
  // ==========================
  const electricBlue = useMemo(() => new THREE.Color("#0af3ff"), []);
  const deepPurple = useMemo(() => new THREE.Color("#5b2cff"), []);
  const cyan = useMemo(() => new THREE.Color("#22d3ee"), []);
  const softWhite = useMemo(() => new THREE.Color("#e5e7eb"), []);

  const accentA = variant === "coding" ? deepPurple : electricBlue;
  const accentB = variant === "coding" ? electricBlue : deepPurple;

  // Circuit texture overlay for a more “tech board” feel.
  const circuitTexture = useLoader(TextureLoader, "/assets/ai-circuit.png");
  const circuitMat = useMemo(() => {
    // Ensure correct color space for neon on dark texture.
    circuitTexture.colorSpace = THREE.SRGBColorSpace;
    circuitTexture.anisotropy = 4;

    return new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.08,
      metalness: 0.05,
      roughness: 0.45,
      map: circuitTexture,
      emissive: electricBlue,
      emissiveIntensity: 3.0,
      emissiveMap: circuitTexture,
      blending: THREE.NormalBlending,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
  }, [circuitTexture, electricBlue]);

  // ==========================
  // Node network (structured lattice)
  // ==========================
  // Slightly reduced density for smoother motion.
  const latSteps = 9;
  const lonSteps = 18;

  const nodeMeta = useMemo(() => {
    const nodes: Array<{ x: number; y: number; z: number; phase: number }> = [];
    for (let i = 0; i <= latSteps; i++) {
      const latT = i / latSteps; // 0..1
      const phi = latT * Math.PI; // 0..PI
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      for (let j = 0; j < lonSteps; j++) {
        const lonT = j / lonSteps; // 0..1
        const theta = lonT * Math.PI * 2;
        const x = sinPhi * Math.cos(theta);
        const y = cosPhi;
        const z = sinPhi * Math.sin(theta);
        const phase = latT * 6.0 + lonT * 10.0;
        nodes.push({ x, y, z, phase });
      }
    }
    return nodes;
  }, []);

  const nodeCount = nodeMeta.length;

  const nodePositions = useMemo(() => {
    const arr = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i++) {
      const n = nodeMeta[i];
      arr[i * 3 + 0] = n.x;
      arr[i * 3 + 1] = n.y;
      arr[i * 3 + 2] = n.z;
    }
    return arr;
  }, [nodeMeta, nodeCount]);

  const nodeBasePositions = useMemo(() => nodePositions.slice(0), [nodePositions]);

  const nodePhases = useMemo(() => {
    const phases = new Float32Array(nodeCount);
    for (let i = 0; i < nodeCount; i++) phases[i] = nodeMeta[i].phase;
    return phases;
  }, [nodeMeta, nodeCount]);

  const nodeColors = useMemo(() => {
    const colors = new Float32Array(nodeCount * 3);
    const tmp = new THREE.Color();

    for (let i = 0; i < nodeCount; i++) {
      const t = (Math.sin(nodePhases[i] * 0.7) + 1) / 2; // 0..1
      const c1 = variant === "coding" ? electricBlue : deepPurple;
      const c2 = variant === "coding" ? deepPurple : electricBlue;
      tmp.copy(c1).lerp(c2, t * 0.65).lerp(cyan, (1 - t) * 0.35);

      // Rare white glints.
      const glint = (Math.sin(nodePhases[i] * 0.23) + 1) / 2;
      tmp.lerp(softWhite, Math.pow(glint, 8) * 0.55);

      colors[i * 3 + 0] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }

    return colors;
  }, [nodePhases, nodeCount, variant, electricBlue, deepPurple, cyan, softWhite]);

  const nodeGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(nodeColors, 3));
    return g;
  }, [nodePositions, nodeColors]);

  const pointsMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.03,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  const linePairs = useMemo(() => {
    const pairs: number[] = [];
    const stride = lonSteps;
    const idx = (latIndex: number, lonIndex: number) =>
      latIndex * stride + ((lonIndex % stride) + stride) % stride;

    // Neighbor links on the lattice: vertical + horizontal + diagonal.
    for (let i = 0; i < latSteps; i++) {
      for (let j = 0; j < lonSteps; j++) {
        const a = idx(i, j);
        const b = idx(i + 1, j);
        const c = idx(i, j + 1);
        const d = idx(i + 1, j + 1);
        pairs.push(a, b);
        pairs.push(a, c);
        pairs.push(a, d);
      }
    }

    return new Int32Array(pairs);
  }, [latSteps, lonSteps]);

  const lineCount = linePairs.length / 2;

  const linePositions = useMemo(() => new Float32Array(lineCount * 2 * 3), [lineCount]);

  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    // Required for dashed materials to render consistently.
    (g as any).computeLineDistances?.();
    return g;
  }, [linePositions]);

  const lineMaterial = useMemo(() => {
    return new THREE.LineDashedMaterial({
      color: accentB,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      dashSize: 0.14,
      gapSize: 0.1,
    });
  }, [accentB]);

  // ==========================
  // Data packets (signals)
  // ==========================
  const signalCount = 44;

  const signalSegments = useMemo(() => {
    // Pick some edges and move “data packets” along them.
    const edgeCount = linePairs.length / 2;
    const aArr = new Int32Array(signalCount);
    const bArr = new Int32Array(signalCount);
    const speedArr = new Float32Array(signalCount);
    const tArr = new Float32Array(signalCount);

    for (let i = 0; i < signalCount; i++) {
      const edgeIndex = Math.floor(Math.random() * Math.max(1, edgeCount));
      const a = linePairs[edgeIndex * 2 + 0] ?? 0;
      const b = linePairs[edgeIndex * 2 + 1] ?? 0;
      aArr[i] = a;
      bArr[i] = b;
      speedArr[i] = 0.15 + Math.random() * 0.55;
      tArr[i] = Math.random();
    }

    return { aArr, bArr, speedArr, tArr };
  }, [linePairs]);

  const signalPositions = useMemo(() => new Float32Array(signalCount * 3), [signalCount]);
  const signalGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(signalPositions, 3));
    return g;
  }, [signalPositions]);

  const signalMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: electricBlue,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [electricBlue]);

  // ==========================
  // Orbit particles (light trails)
  // ==========================
  const orbitCount = 360;
  const orbitData = useMemo(() => {
    const radii = new Float32Array(orbitCount);
    const phases = new Float32Array(orbitCount);
    const speeds = new Float32Array(orbitCount);
    const heights = new Float32Array(orbitCount);
    for (let i = 0; i < orbitCount; i++) {
      // Keep them relatively close to the core so the background stays subtle.
      radii[i] = 1.35 + Math.random() * 0.9;
      phases[i] = Math.random() * Math.PI * 2;
      // Lower speed range for smoother motion feel.
      speeds[i] = 0.12 + Math.random() * 0.28;
      heights[i] = (Math.random() - 0.5) * 1.4;
    }
    return { radii, phases, speeds, heights };
  }, []);

  const orbitPositions = useMemo(() => new Float32Array(orbitCount * 3), [orbitCount]);
  const orbitGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(orbitPositions, 3));
    return g;
  }, [orbitPositions]);

  const orbitMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: accentA,
      size: 0.02,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [accentA]);

  const sweepRef = useRef<THREE.Points>(null);
  const sweepGeometry = useMemo(() => {
    const sweepCount = 96;
    const arr = new Float32Array(sweepCount * 3);
    const r = 1.6;
    for (let i = 0; i < sweepCount; i++) {
      const tt = i / sweepCount;
      const a = tt * Math.PI * 2;
      arr[i * 3 + 0] = Math.cos(a) * r;
      arr[i * 3 + 1] = Math.sin(a) * 0.03;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  const sweepMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: electricBlue,
      size: 0.045,
      transparent: true,
      opacity: 0.14,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [electricBlue]);

  // Seed initial orbit positions once.
  useMemo(() => {
    for (let i = 0; i < orbitCount; i++) {
      const r = orbitData.radii[i];
      const a = orbitData.phases[i];
      orbitPositions[i * 3 + 0] = Math.cos(a) * r;
      orbitPositions[i * 3 + 1] = orbitData.heights[i];
      orbitPositions[i * 3 + 2] = Math.sin(a) * r;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================
  // Wireframe + rings
  // ==========================
  const wireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: softWhite,
        transparent: true,
        opacity: 0.16,
        wireframe: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [softWhite],
  );

  const ringMats = useMemo(() => {
    const mk = (color: THREE.ColorRepresentation, opacity: number) =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        wireframe: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
    return [mk(electricBlue, 0.16), mk(deepPurple, 0.14), mk(cyan, 0.14), mk(softWhite, 0.1)];
  }, [electricBlue, deepPurple, cyan, softWhite]);

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime();
    const sp = scrollProgressRef.current;
    const m = mouse.current;

    // Holo parallax: tilt slightly with mouse, bob with scroll.
    if (group.current) {
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -m.y * 0.25, 0.04);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, m.x * 0.25, 0.04);
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, sp * -0.08, 0.03);
      group.current.rotation.z += dt * 0.017;
    }

    // Pulsing glow (data flow).
    const pulse = 0.60 + 0.35 * Math.sin(t * 0.76 + sp * 1.15);
    const pulse2 = 0.60 + 0.35 * Math.sin(t * 0.56 + sp * 0.9);

    // Lower network opacities to let the circuit texture read more clearly.
    const targetPointsOpacity = 0.22 + pulse * 0.12;
    const targetLinesOpacity = 0.060 + pulse2 * 0.08;
    const targetSweepOpacity = 0.045 + pulse * 0.07;

    smoothPointsOpacity.current = THREE.MathUtils.lerp(smoothPointsOpacity.current, targetPointsOpacity, 0.06);
    smoothLinesOpacity.current = THREE.MathUtils.lerp(smoothLinesOpacity.current, targetLinesOpacity, 0.06);
    smoothSweepOpacity.current = THREE.MathUtils.lerp(smoothSweepOpacity.current, targetSweepOpacity, 0.06);

    pointsMaterial.opacity = smoothPointsOpacity.current;
    lineMaterial.opacity = smoothLinesOpacity.current;
    sweepMaterial.opacity = smoothSweepOpacity.current;
    signalMaterial.opacity = 0.22 + smoothPointsOpacity.current * 0.45;

    if (sweepRef.current) {
      // Reduce sweep rotation speed to avoid “jittery” feel.
      sweepRef.current.rotation.y = t * (0.24 + sp * 0.06);
    }

    // Animate node positions + colors (subtle wave outward/inward).
    const base = nodeBasePositions;
    const posAttr = nodeGeometry.getAttribute("position") as THREE.BufferAttribute;
    const colAttr = nodeGeometry.getAttribute("color") as THREE.BufferAttribute;
    for (let i = 0; i < nodeCount; i++) {
      const phase = nodePhases[i];
      const idx = i * 3;
      const x0 = base[idx + 0];
      const y0 = base[idx + 1];
      const z0 = base[idx + 2];

      const wave = 0.012 * Math.sin(t * 0.55 + phase + sp * 0.9);
      posAttr.array[idx + 0] = x0 * (1 + wave);
      posAttr.array[idx + 1] = y0 * (1 + wave);
      posAttr.array[idx + 2] = z0 * (1 + wave);

      // Per-node brightness modulation to mimic streaming data.
      // Smaller brightness modulation for less flicker/jitter.
      const brightness = 0.65 + 0.30 * Math.sin(t * 0.60 + phase * 0.45 + sp * 1.6);
      colAttr.array[idx + 0] = Math.min(1, nodeColors[idx + 0] * brightness);
      colAttr.array[idx + 1] = Math.min(1, nodeColors[idx + 1] * brightness);
      colAttr.array[idx + 2] = Math.min(1, nodeColors[idx + 2] * brightness);
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    // Move data packets along some of the network edges.
    const sigAttr = signalGeometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < signalCount; i++) {
      const a = signalSegments.aArr[i];
      const b = signalSegments.bArr[i];
      const idxA = a * 3;
      const idxB = b * 3;

      const speed = signalSegments.speedArr[i];
      const advance = dt * speed * (0.55 + sp * 0.45);
      let tt = signalSegments.tArr[i] + advance;
      if (tt > 1) tt -= 1;
      signalSegments.tArr[i] = tt;

      const t01 = tt;
      sigAttr.array[i * 3 + 0] = posAttr.array[idxA + 0] * (1 - t01) + posAttr.array[idxB + 0] * t01;
      sigAttr.array[i * 3 + 1] = posAttr.array[idxA + 1] * (1 - t01) + posAttr.array[idxB + 1] * t01;
      sigAttr.array[i * 3 + 2] = posAttr.array[idxA + 2] * (1 - t01) + posAttr.array[idxB + 2] * t01;
    }
    sigAttr.needsUpdate = true;

    // Update lines from the updated node positions.
    const lineAttr = lineGeometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < lineCount; i++) {
      const a = linePairs[i * 2 + 0];
      const b = linePairs[i * 2 + 1];
      const ia = a * 3;
      const ib = b * 3;
      const ol = i * 2 * 3;

      lineAttr.array[ol + 0] = posAttr.array[ia + 0];
      lineAttr.array[ol + 1] = posAttr.array[ia + 1];
      lineAttr.array[ol + 2] = posAttr.array[ia + 2];

      lineAttr.array[ol + 3] = posAttr.array[ib + 0];
      lineAttr.array[ol + 4] = posAttr.array[ib + 1];
      lineAttr.array[ol + 5] = posAttr.array[ib + 2];
    }
    lineAttr.needsUpdate = true;

    // Orbit particles: update positions each frame for light trails.
    const orbitAttr = orbitGeometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < orbitCount; i++) {
      const r = orbitData.radii[i];
      const a = orbitData.phases[i] + t * orbitData.speeds[i] * (0.55 + sp * 0.35);
      const y = orbitData.heights[i] + Math.sin(t * 0.42 + i) * 0.13;
      orbitAttr.array[i * 3 + 0] = Math.cos(a) * r;
      orbitAttr.array[i * 3 + 1] = y;
      orbitAttr.array[i * 3 + 2] = Math.sin(a) * r;
    }
    orbitAttr.needsUpdate = true;
  });

  return (
    <group ref={group}>
      {/* Rotating holographic rings frame */}
      <group>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.45, 0.01, 2, 120]} />
          <primitive object={ringMats[0]} attach="material" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[1.18, 0.01, 2, 120]} />
          <primitive object={ringMats[1]} attach="material" />
        </mesh>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[1.02, 0.01, 2, 96]} />
          <primitive object={ringMats[2]} attach="material" />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.78, 0.01, 2, 72]} />
          <primitive object={ringMats[3]} attach="material" />
        </mesh>
      </group>

      {/* Subtle wireframe core */}
      <mesh>
        <sphereGeometry args={[0.85, 32, 32]} />
        <primitive object={wireMat} attach="material" />
      </mesh>

      {/* Textured circuit glass shell (reference-inspired) */}
      <mesh scale={0.98}>
        <sphereGeometry args={[0.87, 28, 28]} />
        <primitive object={circuitMat} attach="material" />
      </mesh>

      {/* Glowing node network */}
      <points geometry={nodeGeometry} material={pointsMaterial} />
      <lineSegments geometry={lineGeometry} material={lineMaterial} />

      {/* Data packet signals */}
      <points geometry={signalGeometry} material={signalMaterial} />

      {/* Radar sweep ring (systems/data feel) */}
      <points ref={sweepRef} geometry={sweepGeometry} material={sweepMaterial} />

      {/* Orbiting particles for depth */}
      <points geometry={orbitGeometry} material={orbitMaterial} position={[0, 0.02, 0]} />
    </group>
  );
}

