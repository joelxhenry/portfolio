"use client";

import { Box, useColorModeValue } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

import ColorScheme from "../assets/colors";

// Audio-reactive centrepiece for the live voice dialog. Draws a central
// breathing orb with radial frequency bars pulled from an AnalyserNode on
// the bot's output chain, plus a subtle ring that swells with the
// visitor's own mic level. The whole thing runs on a single canvas and a
// single requestAnimationFrame loop — no per-frame React state churn.
//
// The component is deliberately dumb: it knows nothing about Gemini, the
// session lifecycle, or React data flow. It just takes analyser getters
// and a `speaking` hint and renders pixels.

export type BotVisualizerState =
  | "idle"
  | "connecting"
  | "listening"
  | "speaking"
  | "error";

export interface BotVisualizerProps {
  state: BotVisualizerState;
  getOutputAnalyser: () => AnalyserNode | null;
  getInputAnalyser: () => AnalyserNode | null;
}

const TAU = Math.PI * 2;

// Convert a CSS color string — including the site's primary accent hex or
// rgba — into an {r,g,b} tuple. Everything we draw is a variant of this
// single colour so the orb feels native to the theme.
function parseColor(input: string): { r: number; g: number; b: number } {
  if (input.startsWith("#")) {
    const hex = input.slice(1);
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
  }
  const rgbaMatch = input.match(
    /rgba?\(([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/,
  );
  if (rgbaMatch) {
    return {
      r: Number(rgbaMatch[1]),
      g: Number(rgbaMatch[2]),
      b: Number(rgbaMatch[3]),
    };
  }
  return { r: 200, g: 230, b: 78 };
}

export default function BotVisualizer({
  state,
  getOutputAnalyser,
  getInputAnalyser,
}: BotVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<BotVisualizerState>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const primaryColor = useColorModeValue(
    ColorScheme.light.primary,
    ColorScheme.dark.primary,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rgb = parseColor(primaryColor);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let frame = 0;
    let running = true;
    let rafId = 0;

    // Typed-array buffers reused every frame to avoid GC churn. Sized off
    // the analyser's frequencyBinCount — which is fftSize / 2 = 512 for
    // the fftSize 1024 we configure in useLiveVoice.
    let outBins = new Uint8Array(0);
    let inBins = new Uint8Array(0);

    // Smoothed amplitude envelopes so the orb glides between sizes
    // instead of jittering frame-to-frame on transient spikes.
    let outAmp = 0;
    let inAmp = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    };
    resize();
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(resize)
        : null;
    resizeObserver?.observe(canvas);

    const draw = () => {
      if (!running) return;
      frame += 1;

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const minSide = Math.min(width, height);

      ctx.clearRect(0, 0, width, height);

      // Pull the latest analyser data. Either analyser can be null while
      // the session is setting up — in that case we fall back to a gentle
      // idle animation driven by time alone.
      const outAnalyser = getOutputAnalyser();
      const inAnalyser = getInputAnalyser();

      let rawOut = 0;
      if (outAnalyser) {
        const bins = outAnalyser.frequencyBinCount;
        if (outBins.length !== bins) outBins = new Uint8Array(bins);
        outAnalyser.getByteFrequencyData(outBins);
        // Mean across the lower half — speech energy lives there and it
        // makes the orb feel "tied to the voice" instead of every hiss.
        const upto = Math.floor(bins / 2);
        let sum = 0;
        for (let i = 0; i < upto; i += 1) sum += outBins[i]!;
        rawOut = sum / upto / 255;
      }

      let rawIn = 0;
      if (inAnalyser) {
        const bins = inAnalyser.frequencyBinCount;
        if (inBins.length !== bins) inBins = new Uint8Array(bins);
        inAnalyser.getByteFrequencyData(inBins);
        const upto = Math.floor(bins / 2);
        let sum = 0;
        for (let i = 0; i < upto; i += 1) sum += inBins[i]!;
        rawIn = sum / upto / 255;
      }

      // Exponential smoothing — attack fast, release slow, so a sudden
      // word lands immediately but the orb decays gracefully between
      // words.
      outAmp += (rawOut - outAmp) * (rawOut > outAmp ? 0.45 : 0.12);
      inAmp += (rawIn - inAmp) * (rawIn > inAmp ? 0.45 : 0.12);

      const currentState = stateRef.current;

      // Idle / connecting baseline — a slow sine wave so the orb isn't
      // dead when no audio is flowing.
      const idleBreath = 0.04 + Math.sin(frame * 0.03) * 0.015;
      const baseRadius = minSide * 0.18;

      // Connecting state gets a visibly faster breath so the user knows
      // something is happening.
      const connectingBreath =
        0.06 + Math.sin(frame * 0.08) * 0.03;

      let envelope: number;
      if (currentState === "speaking") {
        envelope = outAmp * 0.9 + idleBreath;
      } else if (currentState === "listening") {
        envelope = Math.max(inAmp * 0.6, idleBreath);
      } else if (currentState === "connecting") {
        envelope = connectingBreath;
      } else if (currentState === "error") {
        envelope = 0.02;
      } else {
        envelope = idleBreath;
      }

      // === Layer 1: outer ambient glow =========================
      const glowRadius = baseRadius * (1 + envelope * 2.2);
      const glow = ctx.createRadialGradient(cx, cy, baseRadius * 0.1, cx, cy, glowRadius * 1.6);
      glow.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},${0.35 + envelope * 0.3})`);
      glow.addColorStop(0.4, `rgba(${rgb.r},${rgb.g},${rgb.b},${0.12 + envelope * 0.15})`);
      glow.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius * 1.6, 0, TAU);
      ctx.fill();

      // === Layer 2: radial frequency bars around the orb =======
      // Rendered from the upper half of the output spectrum so the bars
      // react to speech harmonics rather than just the fundamental.
      if (outAnalyser && outBins.length > 0 && currentState !== "idle") {
        const bars = 96;
        const binStride = Math.max(1, Math.floor(outBins.length / bars));
        const barInnerRadius = baseRadius * (1.05 + envelope * 0.4);
        ctx.save();
        ctx.translate(cx, cy);
        for (let i = 0; i < bars; i += 1) {
          const bin = outBins[i * binStride] ?? 0;
          const magnitude = bin / 255;
          // Gentle exponential curve so quiet frequencies still read.
          const shaped = Math.pow(magnitude, 0.75);
          const length = shaped * minSide * 0.12 + 2;
          const angle = (i / bars) * TAU - Math.PI / 2;
          const x1 = Math.cos(angle) * barInnerRadius;
          const y1 = Math.sin(angle) * barInnerRadius;
          const x2 = Math.cos(angle) * (barInnerRadius + length);
          const y2 = Math.sin(angle) * (barInnerRadius + length);
          ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${0.25 + shaped * 0.55})`;
          ctx.lineWidth = Math.max(1.2, minSide * 0.0035);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // === Layer 3: central breathing orb ======================
      const orbRadius = baseRadius * (1 + envelope * 0.7);
      const orbGradient = ctx.createRadialGradient(
        cx,
        cy - orbRadius * 0.25,
        orbRadius * 0.1,
        cx,
        cy,
        orbRadius,
      );
      orbGradient.addColorStop(0, `rgba(${rgb.r},${rgb.g},${rgb.b},0.95)`);
      orbGradient.addColorStop(0.6, `rgba(${rgb.r},${rgb.g},${rgb.b},0.55)`);
      orbGradient.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0.18)`);
      ctx.fillStyle = orbGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius, 0, TAU);
      ctx.fill();

      // Thin highlight ring so the orb reads as 3D rather than flat.
      ctx.strokeStyle = `rgba(255,255,255,0.12)`;
      ctx.lineWidth = Math.max(1, minSide * 0.002);
      ctx.beginPath();
      ctx.arc(cx, cy, orbRadius * 0.98, 0, TAU);
      ctx.stroke();

      // === Layer 4: input (mic) pulse rings ====================
      // When the visitor is talking we emit outward-travelling rings so
      // they get visual feedback that the mic is hot, even when the bot
      // is silent.
      if (currentState === "listening" && inAmp > 0.05) {
        const rings = 3;
        for (let i = 0; i < rings; i += 1) {
          const phase = ((frame + i * 24) % 90) / 90;
          const ringRadius = baseRadius * (1 + phase * 2.4);
          ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${(1 - phase) * inAmp * 0.7})`;
          ctx.lineWidth = Math.max(1, minSide * 0.0025);
          ctx.beginPath();
          ctx.arc(cx, cy, ringRadius, 0, TAU);
          ctx.stroke();
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
    };
    // We only want to (re)build the draw loop when the theme color
    // changes; analyser getters are stable refs and `state` is read via
    // stateRef inside the loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [primaryColor]);

  return (
    <Box
      position="relative"
      width="100%"
      height="100%"
      minH="220px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
        aria-hidden
      />
    </Box>
  );
}
