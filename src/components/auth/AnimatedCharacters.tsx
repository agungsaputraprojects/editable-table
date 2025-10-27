"use client";

import { useEffect, useState, useRef } from "react";

interface MousePosition {
  x: number;
  y: number;
}

export function AnimatedCharacters() {
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculateEyePosition = (
    characterX: number,
    characterY: number,
    maxMove: number = 8
  ) => {
    if (!containerRef.current) return { x: 0, y: 0 };

    const deltaX = mousePos.x - characterX;
    const deltaY = mousePos.y - characterY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance === 0) return { x: 0, y: 0 };

    const moveX = (deltaX / distance) * Math.min(distance / 20, maxMove);
    const moveY = (deltaY / distance) * Math.min(distance / 20, maxMove);

    return { x: moveX, y: moveY };
  };

  const purpleEye = calculateEyePosition(200, 200, 10);
  const blackEye = calculateEyePosition(240, 250, 8);
  const orangeEye = calculateEyePosition(150, 300, 7);
  const yellowEye = calculateEyePosition(280, 280, 6);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-gray-100"
    >
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full max-w-md"
        style={{ maxHeight: "500px" }}
      >
        <g>
          <path
            d="M 80 320 A 100 100 0 0 1 280 320 Z"
            fill="#FF6B35"
            transform="translate(0, -40)"
          />
          <circle
            cx={150 + orangeEye.x}
            cy={300 + orangeEye.y}
            r="6"
            fill="#2D3436"
          />
          <circle
            cx={180 + orangeEye.x}
            cy={300 + orangeEye.y}
            r="6"
            fill="#2D3436"
          />
          <path
            d="M 140 315 Q 165 325 190 315"
            stroke="#2D3436"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        <g transform="rotate(-15 200 200)">
          <rect x="160" y="140" width="80" height="120" fill="#6C5CE7" rx="8" />
          <circle
            cx={185 + purpleEye.x}
            cy={185 + purpleEye.y}
            r="7"
            fill="white"
          />
          <circle
            cx={215 + purpleEye.x}
            cy={185 + purpleEye.y}
            r="7"
            fill="white"
          />
          <circle
            cx={185 + purpleEye.x}
            cy={185 + purpleEye.y}
            r="3"
            fill="#2D3436"
          />
          <circle
            cx={215 + purpleEye.x}
            cy={185 + purpleEye.y}
            r="3"
            fill="#2D3436"
          />
          <path
            d="M 185 210 Q 200 220 215 210"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        <g transform="rotate(10 240 250)">
          <rect x="200" y="210" width="80" height="100" fill="#2D3436" rx="6" />
          <circle
            cx={225 + blackEye.x}
            cy={245 + blackEye.y}
            r="6"
            fill="white"
          />
          <circle
            cx={255 + blackEye.x}
            cy={245 + blackEye.y}
            r="6"
            fill="white"
          />
          <circle
            cx={225 + blackEye.x}
            cy={245 + blackEye.y}
            r="3"
            fill="#2D3436"
          />
          <circle
            cx={255 + blackEye.x}
            cy={245 + blackEye.y}
            r="3"
            fill="#2D3436"
          />
        </g>

        <g transform="rotate(5 280 280)">
          <rect x="240" y="230" width="80" height="110" fill="#FDD835" rx="6" />
          <circle
            cx={265 + yellowEye.x}
            cy={270 + yellowEye.y}
            r="5"
            fill="#2D3436"
          />
          <circle
            cx={295 + yellowEye.x}
            cy={270 + yellowEye.y}
            r="5"
            fill="#2D3436"
          />
          <line
            x1="270"
            y1="295"
            x2="290"
            y2="295"
            stroke="#2D3436"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
