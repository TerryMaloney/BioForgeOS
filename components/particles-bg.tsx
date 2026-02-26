"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import type { ISourceOptions } from "@tsparticles/engine";

const options: ISourceOptions = {
  fullScreen: { enable: true, zIndex: -1 },
  background: { color: { value: "transparent" } },
  particles: {
    number: { value: 28 },
    color: { value: "#22c55e" },
    shape: { type: "circle" },
    opacity: { value: 0.25 },
    size: { value: { min: 1, max: 2.5 } },
    move: {
      enable: true,
      speed: 0.4,
      direction: "none",
      random: true,
      outModes: "out",
    },
    links: {
      enable: true,
      distance: 140,
      color: "rgba(34, 197, 94, 0.15)",
      width: 0.5,
    },
  },
  interactivity: { detect_on: "canvas", events: { onHover: { enable: false }, onClick: { enable: false } }, modes: {} },
};

export function ParticlesBg() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
      setInit(true);
    });
  }, []);

  if (!init) return null;

  return (
    <div className="particles-bg" aria-hidden>
      <Particles id="bioforge-particles" options={options} style={{ position: "absolute", inset: 0 }} />
    </div>
  );
}
