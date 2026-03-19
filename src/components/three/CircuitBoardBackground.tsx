"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";

type Edge = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  thick: number; // 1..2
  baseAlpha: number; // 0..1
  speed: number; // radians per second
  phase: number; // 0..1
  pulse: boolean;
};

type Node = {
  x: number;
  y: number;
  shape: 0 | 1; // 0 square, 1 circle
  seed: number;
  hasNeighbors: boolean;
};

export default function CircuitBoardBackground({
  mouse,
}: {
  mouse: MutableRefObject<THREE.Vector2>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Procedurally draw a PCB texture onto a canvas, then use it as a map.
  const {
    canvas,
    texture,
    drawOnce,
    updateTime,
  } = useMemo(() => {
    const size = 1024;
    const margin = 64;
    const gridN = 34; // number of nodes along one axis

    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("Failed to create 2d context");

    // Deterministic-ish RNG so it stays stable across renders.
    let seed = 1337;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    const usable = size - margin * 2;
    const step = usable / (gridN - 1);

    const nodes: Node[] = [];
    const idx = (i: number, j: number) => i * gridN + j;

    // Adjacency for “hasNeighbors”.
    const neighbors = new Array(gridN * gridN).fill(false);

    const edges: Edge[] = [];

    const neon = "#29e7ff";
    const electric = "#0af3ff";
    const deep = "#04030a";
    const purple = "#5b2cff";

    // Create nodes on a lattice.
    for (let i = 0; i < gridN; i++) {
      for (let j = 0; j < gridN; j++) {
        const x = margin + j * step;
        const y = margin + i * step;
        nodes.push({
          x,
          y,
          shape: (rand() > 0.6 ? 1 : 0) as 0 | 1,
          seed: rand(),
          hasNeighbors: false,
        });
      }
    }

    // Connect mostly all right/down neighbors to avoid “empty spaces”.
    // Then vary thickness/alpha so it’s not uniform.
    const connectProb = 0.93;
    const thickProb = 0.22;
    for (let i = 0; i < gridN; i++) {
      for (let j = 0; j < gridN; j++) {
        // right edge
        if (j < gridN - 1) {
          if (rand() < connectProb) {
            neighbors[idx(i, j)] = true;
            neighbors[idx(i, j + 1)] = true;
            const thick = rand() < thickProb ? 2 : 1;
            edges.push({
              x0: margin + j * step,
              y0: margin + i * step,
              x1: margin + (j + 1) * step,
              y1: margin + i * step,
              thick,
              baseAlpha: thick === 2 ? 0.22 : 0.12,
              speed: 0.65 + rand() * 1.25,
              phase: rand(),
              pulse: rand() < 0.55,
            });
          }
        }

        // down edge
        if (i < gridN - 1) {
          if (rand() < connectProb) {
            neighbors[idx(i, j)] = true;
            neighbors[idx(i + 1, j)] = true;
            const thick = rand() < thickProb ? 2 : 1;
            edges.push({
              x0: margin + j * step,
              y0: margin + i * step,
              x1: margin + j * step,
              y1: margin + (i + 1) * step,
              thick,
              baseAlpha: thick === 2 ? 0.22 : 0.12,
              speed: 0.65 + rand() * 1.25,
              phase: rand(),
              pulse: rand() < 0.55,
            });
          }
        }
      }
    }

    // Update node neighbor flags.
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].hasNeighbors = neighbors[i];
    }

    // Tiny micro-dots along a subset of edges.
    const microDots: Array<{ x: number; y: number; seed: number }> = [];
    for (let e = 0; e < edges.length; e++) {
      const edge = edges[e];
      if (!edge.pulse) continue;
      // Add a few micro dots per edge.
      const count = edge.thick === 2 ? 2 + Math.floor(rand() * 3) : 1 + Math.floor(rand() * 2);
      for (let k = 0; k < count; k++) {
        const u = rand();
        microDots.push({
          x: edge.x0 * (1 - u) + edge.x1 * u,
          y: edge.y0 * (1 - u) + edge.y1 * u,
          seed: rand(),
        });
      }
    }

    // Chip-like rectangles (motherboard flavor)
    const chips: Array<{ x: number; y: number; w: number; h: number; rot: number; seed: number }> = [];
    const chipCount = 22;
    for (let i = 0; i < chipCount; i++) {
      const gx = Math.floor(rand() * (gridN - 6)) + 3;
      const gy = Math.floor(rand() * (gridN - 6)) + 3;
      const wCells = 2 + Math.floor(rand() * 3);
      const hCells = 2 + Math.floor(rand() * 3);
      const w = wCells * step * (0.72 + rand() * 0.25);
      const h = hCells * step * (0.72 + rand() * 0.25);
      const x = margin + gx * step + (rand() - 0.5) * step * 0.25;
      const y = margin + gy * step + (rand() - 0.5) * step * 0.25;
      chips.push({ x, y, w, h, rot: (rand() - 0.5) * 0.08, seed: rand() });
    }

    // Connection pads: a few ring/circle pads at nodes.
    const pads: Array<{ x: number; y: number; seed: number }> = [];
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (!n.hasNeighbors) continue;
      // Keep pads sparse.
      if (n.seed < 0.035) pads.push({ x: n.x, y: n.y, seed: n.seed });
    }

    const drawStaticBg = () => {
      // Base dark navy/black gradient.
      const g = ctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, "#060515");
      g.addColorStop(0.5, deep);
      g.addColorStop(1, "#000005");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);

      // Subtle gradient lighting / vignette.
      const rg = ctx.createRadialGradient(size * 0.55, size * 0.35, size * 0.05, size * 0.55, size * 0.5, size * 0.75);
      rg.addColorStop(0, "rgba(41,231,255,0.12)");
      rg.addColorStop(0.4, "rgba(91,44,255,0.06)");
      rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, size, size);

      // Gentle scanlines.
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = "#0af3ff";
      for (let y = 0; y < size; y += 4) {
        ctx.fillRect(0, y, size, 1);
      }
      ctx.globalAlpha = 1;
    };

    const draw = (time: number) => {
      // We redraw because we want pulses traveling + slight node flicker.
      drawStaticBg();

      // Draw underlay “thicker” traces for layered depth.
      ctx.globalCompositeOperation = "source-over";
      ctx.lineCap = "round";

      // Underlay
      for (let i = 0; i < edges.length; i++) {
        const e = edges[i];
        const under = e.thick === 2 ? 0.18 : 0.10;
        ctx.strokeStyle = `rgba(10,243,255,${under})`;
        ctx.lineWidth = e.thick === 2 ? 3.1 : 2.1;
        ctx.beginPath();
        ctx.moveTo(e.x0 + 0.8, e.y0 + 0.5);
        ctx.lineTo(e.x1 + 0.8, e.y1 + 0.5);
        ctx.stroke();
      }

      // Main traces (faint but crisp)
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < edges.length; i++) {
        const e = edges[i];
        const baseAlpha = e.baseAlpha;
        const glow = e.pulse ? 0.35 : 0.12;

        // Traveling pulse along the edge.
        const u = ((time * e.speed + e.phase * 10) % 1 + 1) % 1;
        const half = 0.055 + (e.thick === 2 ? 0.02 : 0);
        let p0 = u - half;
        let p1 = u + half;
        if (p0 < 0) p0 = 0;
        if (p1 > 1) p1 = 1;

        // Base line always present.
        ctx.strokeStyle = `rgba(10,243,255,${baseAlpha})`;
        ctx.lineWidth = e.thick === 2 ? 2.0 : 1.3;
        ctx.beginPath();
        ctx.moveTo(e.x0, e.y0);
        ctx.lineTo(e.x1, e.y1);
        ctx.stroke();

        // Pulse overlay segment.
        const sx = e.x0 * (1 - p0) + e.x1 * p0;
        const sy = e.y0 * (1 - p0) + e.y1 * p0;
        const ex = e.x0 * (1 - p1) + e.x1 * p1;
        const ey = e.y0 * (1 - p1) + e.y1 * p1;

        ctx.strokeStyle = `rgba(34,211,238,${glow})`;
        ctx.lineWidth = e.thick === 2 ? 2.2 : 1.6;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }

      // Micro dots (active sparkle)
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < microDots.length; i++) {
        const d = microDots[i];
        const flicker = Math.max(0, Math.sin(time * 1.6 + d.seed * 20));
        const a = 0.15 + flicker * 0.6;
        ctx.fillStyle = `rgba(10,243,255,${a})`;
        const r = d.seed > 0.7 ? 1.4 : 0.95;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Chips
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < chips.length; i++) {
        const ch = chips[i];
        ctx.save();
        ctx.translate(ch.x, ch.y);
        ctx.rotate(ch.rot);
        ctx.strokeStyle = `rgba(91,44,255,${0.16 + ch.seed * 0.08})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-ch.w / 2, -ch.h / 2, ch.w, ch.h, 6);
        ctx.stroke();

        // Inner neon outline
        ctx.strokeStyle = `rgba(34,211,238,${0.10 + Math.max(0, Math.sin(time * 0.9 + ch.seed * 10)) * 0.12})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-ch.w / 2 + 8, -ch.h / 2 + 7, ch.w - 16, ch.h - 14, 4);
        ctx.stroke();
        ctx.restore();
      }

      // Pads (connection points)
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < pads.length; i++) {
        const p = pads[i];
        const flick = Math.max(0, Math.sin(time * 2.0 + p.seed * 35));
        const a = 0.05 + flick * 0.18;
        ctx.strokeStyle = `rgba(10,243,255,${a})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(34,211,238,${a * 0.7})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nodes at intersections (square/circle), with subtle flicker.
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (!n.hasNeighbors) continue;
        const flick = Math.max(0, Math.sin(time * 1.1 + n.seed * 40));
        const a = 0.08 + flick * 0.22;
        ctx.fillStyle = `rgba(10,243,255,${a})`;
        if (n.shape === 0) {
          const s = n.seed > 0.8 ? 4.3 : 3.2;
          ctx.fillRect(n.x - s / 2, n.y - s / 2, s, s);
        } else {
          const r = n.seed > 0.8 ? 2.4 : 1.8;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Soft overall bloom-ish pass by overlaying a blurred-ish glow via alpha draw.
      // (Canvas blur is expensive; instead we do a cheap composite overlay.)
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = `rgba(10,243,255,${0.03 + 0.02 * Math.sin(time * 0.35)})`;
      ctx.fillRect(0, 0, size, size);
      ctx.globalCompositeOperation = "source-over";
    };

    // Initial draw
    draw(0);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;

    let last = -1;

    const drawOnce = () => {
      draw(0);
      tex.needsUpdate = true;
    };

    const updateTime = (time: number) => {
      // Throttle canvas updates for performance.
      const t = Math.floor(time * 12) / 12; // ~12fps
      if (t === last) return;
      last = t;
      draw(time);
      tex.needsUpdate = true;
    };

    return { canvas: c, texture: tex, drawOnce, updateTime };
  }, []);

  useFrame(({ clock }, _delta) => {
    const t = clock.getElapsedTime();
    updateTime(t);

    // Subtle parallax so it feels alive behind text.
    if (meshRef.current) {
      const m = mouse.current;
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, m.x * 0.15, 0.06);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, -m.y * 0.12, 0.06);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, m.x * 0.02, 0.06);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -2]} rotation={[0, 0, 0]}>
      <planeGeometry args={[26, 18]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} depthWrite={false} depthTest={false} />
    </mesh>
  );
}

