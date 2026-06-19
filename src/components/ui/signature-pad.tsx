"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

type SignaturePadProps = {
  label: string;
  description?: string;
  name: string;
};

type Point = {
  x: number;
  y: number;
};

export function SignaturePad({ label, description, name }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const [signatureData, setSignatureData] = useState("");

  function getContext() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return null;
    }

    return canvas.getContext("2d");
  }

  function getPoint(event: ReactPointerEvent<HTMLCanvasElement>): Point | null {
    const canvas = canvasRef.current;

    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function drawLine(point: Point) {
    const context = getContext();
    const canvas = canvasRef.current;

    if (!context || !canvas) {
      return;
    }

    const previousPoint = lastPointRef.current;

    if (!previousPoint) {
      lastPointRef.current = point;
      return;
    }

    context.beginPath();
    context.moveTo(previousPoint.x, previousPoint.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPointRef.current = point;
  }

  function captureSignature() {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    setSignatureData(canvas.toDataURL("image/png"));
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const point = getPoint(event);

    if (!point) {
      return;
    }

    event.preventDefault();
    drawingRef.current = true;
    lastPointRef.current = point;

    const context = getContext();
    if (context) {
      context.beginPath();
      context.moveTo(point.x, point.y);
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) {
      return;
    }

    const point = getPoint(event);

    if (!point) {
      return;
    }

    event.preventDefault();
    drawLine(point);
  }

  function finishDrawing() {
    if (!drawingRef.current) {
      return;
    }

    drawingRef.current = false;
    lastPointRef.current = null;
    captureSignature();
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const context = getContext();

    if (!canvas || !context) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    context.clearRect(0, 0, rect.width, rect.height);
    drawingRef.current = false;
    lastPointRef.current = null;
    setSignatureData("");
  }

  useEffect(() => {
    const resizeCanvas = (keepDrawing = false) => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      const imageData = keepDrawing ? canvas.toDataURL("image/png") : null;
      const rect = canvas.getBoundingClientRect();
      const devicePixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.floor(rect.width * devicePixelRatio));
      canvas.height = Math.max(1, Math.floor(rect.height * devicePixelRatio));
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#1f2937";
      context.lineWidth = 2.5;
      context.clearRect(0, 0, rect.width, rect.height);

      if (imageData) {
        const image = new Image();
        image.onload = () => {
          context.clearRect(0, 0, rect.width, rect.height);
          context.drawImage(image, 0, 0, rect.width, rect.height);
        };
        image.src = imageData;
      }
    };

    resizeCanvas(false);

    const handleResize = () => resizeCanvas(true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{label}</h3>
          {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
        </div>
        <button
          type="button"
          className="rounded-full border border-line bg-panel px-4 py-2 text-sm font-semibold transition hover:bg-white"
          onClick={clearSignature}
        >
          Limpiar
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-dashed border-line bg-panel/30 p-3">
        <canvas
          ref={canvasRef}
          className="h-44 w-full touch-none rounded-xl bg-white"
          onPointerDown={handlePointerDown}
          onPointerLeave={finishDrawing}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrawing}
        />
      </div>

      <input name={name} readOnly type="hidden" value={signatureData} />

      <p className="mt-3 text-xs text-muted">
        {signatureData ? "Firma capturada." : "Firma pendiente."}
      </p>
    </div>
  );
}
