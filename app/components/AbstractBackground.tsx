"use client";

import React from "react";

type Variant = "wave" | "circle" | "geometric";

interface AbstractBackgroundProps {
  variant?: Variant;
  className?: string;
}

function WaveBackground() {
  return (
    <svg
      viewBox="0 0 1440 600"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <path
        d="M0,300 C240,150 480,450 720,300 C960,150 1200,450 1440,300 L1440,600 L0,600 Z"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1.5"
        className="animate-[float_8s_ease-in-out_infinite]"
      />
      <path
        d="M0,350 C200,200 440,500 720,350 C1000,200 1240,500 1440,350 L1440,600 L0,600 Z"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
        className="animate-[float_12s_ease-in-out_infinite_reverse]"
      />
      <path
        d="M0,250 C280,100 520,400 720,250 C920,100 1160,400 1440,250 L1440,600 L0,600 Z"
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
        className="animate-[float_16s_ease-in-out_infinite]"
      />
    </svg>
  );
}

function CircleBackground() {
  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      <circle
        cx="200"
        cy="200"
        r="60"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1.5"
        className="animate-[pulse_6s_ease-in-out_infinite]"
      />
      <circle
        cx="200"
        cy="200"
        r="100"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1"
        className="animate-[pulse_8s_ease-in-out_infinite_0.5s]"
      />
      <circle
        cx="200"
        cy="200"
        r="140"
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
        className="animate-[pulse_10s_ease-in-out_infinite_1s]"
      />
      <circle
        cx="200"
        cy="200"
        r="180"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.5"
        className="animate-[pulse_12s_ease-in-out_infinite_1.5s]"
      />
    </svg>
  );
}

function GeometricBackground() {
  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
    >
      {/* Outer rotating hexagon */}
      <g className="origin-center animate-[spin-slow_30s_linear_infinite]" style={{ transformOrigin: "200px 200px" }}>
        <polygon
          points="200,80 304,140 304,260 200,320 96,260 96,140"
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1"
        />
      </g>
      {/* Mid rotating hexagon (reverse) */}
      <g className="origin-center animate-[spin-slow_24s_linear_infinite_reverse]" style={{ transformOrigin: "200px 200px" }}>
        <polygon
          points="200,120 270,160 270,240 200,280 130,240 130,160"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1"
        />
      </g>
      {/* Inner rotating triangle */}
      <g className="origin-center animate-[spin-slow_18s_linear_infinite]" style={{ transformOrigin: "200px 200px" }}>
        <polygon
          points="200,150 240,220 160,220"
          fill="none"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.5"
        />
      </g>
      {/* Center diamond */}
      <g className="animate-[pulse_6s_ease-in-out_infinite]" style={{ transformOrigin: "200px 200px" }}>
        <polygon
          points="200,175 215,200 200,225 185,200"
          fill="rgba(255,255,255,0.15)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="0.5"
        />
      </g>
    </svg>
  );
}

export default function AbstractBackground({ variant = "wave", className }: AbstractBackgroundProps) {
  return (
    <div className={className ?? "absolute inset-0 overflow-hidden pointer-events-none opacity-20"}>
      {variant === "wave" && <WaveBackground />}
      {variant === "circle" && <CircleBackground />}
      {variant === "geometric" && <GeometricBackground />}
    </div>
  );
}
