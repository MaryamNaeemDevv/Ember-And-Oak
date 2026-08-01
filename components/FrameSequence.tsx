"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 99;
const FRAME_PATH = (i: number) =>
  `/frames/upscaled-video_${String(i).padStart(3, "0")}.jpg`;

// Scroll-progress breakpoints where each part callout should appear.
// Tune these to match where frame separation actually happens in your sequence.
const LABELS = [
  { at: 0.28, text: "FRAME", sub: "wooden base + tapered legs" },
  { at: 0.55, text: "CUSHIONS", sub: "seat + back, foam density layers" },
  { at: 0.62, text: "PILLOWS", sub: "five-piece accent set" },
];

export default function FrameSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameRef = useRef({ progress: 0 });
  const [loaded, setLoaded] = useState(0);
  const [activeLabels, setActiveLabels] = useState<number[]>([]);

  // Preload all frames once.
  useEffect(() => {
    let cancelled = false;
    const imgs: HTMLImageElement[] = [];

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = () => {
        if (!cancelled) setLoaded((n) => n + 1);
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;

    return () => {
      cancelled = true;
    };
  }, []);

  // Draw one image cover-fit — fills the whole box, cropping whatever
  // overflows top/bottom or left/right, so it reaches every edge of the
  // screen. Trade-off vs. the previous contain-fit: on viewports wider
  // than the source frames (1870px), the image gets upscaled slightly to
  // still cover the width, which can soften it a touch — full-bleed was
  // the explicit ask here, so that trade is intentional.
  const drawOne = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    w: number,
    h: number,
    alpha: number
  ) => {
    if (!img.complete || img.naturalWidth === 0) return;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = w / h;
    let dw, dh;
    if (imgRatio > boxRatio) {
      dh = h;
      dw = h * imgRatio;
    } else {
      dw = w;
      dh = w / imgRatio;
    }
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  // Draw the scroll position as a cross-fade between the two nearest real
  // frames, instead of snapping to the nearest whole frame. This is what
  // smooths the motion — no extra source frames needed, just blending
  // between the ones we have based on exact scroll progress.
  const drawAtProgress = (progress: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { clientWidth: w, clientHeight: h } = canvas;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const exact = progress * (FRAME_COUNT - 1);
    const lowIdx = Math.floor(exact);
    const highIdx = Math.min(FRAME_COUNT - 1, lowIdx + 1);
    const blend = exact - lowIdx; // 0..1 between the two frames

    const lowImg = imagesRef.current[lowIdx];
    const highImg = imagesRef.current[highIdx];

    if (lowImg) drawOne(ctx, lowImg, w, h, 1);
    if (highImg && blend > 0) drawOne(ctx, highImg, w, h, blend);

    ctx.globalAlpha = 1;
  };

  // Wire up ScrollTrigger once every frame has loaded.
  useEffect(() => {
    if (loaded < FRAME_COUNT || !wrapperRef.current) return;

    drawAtProgress(0);

    const st = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: "top top",
      end: "+=900%", // controls scrub speed — raise/lower to taste
      pin: true,
      scrub: 1.2, // smoothing lag on top of the cross-fade, for extra smoothness
      onUpdate: (self) => {
        frameRef.current.progress = self.progress;
        drawAtProgress(self.progress);

        const active = LABELS.reduce<number[]>((acc, label, i) => {
          if (self.progress >= label.at && self.progress < label.at + 0.15) {
            acc.push(i);
          }
          return acc;
        }, []);
        setActiveLabels(active);
      },
    });

    const onResize = () => drawAtProgress(frameRef.current.progress);
    window.addEventListener("resize", onResize);

    return () => {
      st.kill();
      window.removeEventListener("resize", onResize);
    };
  }, [loaded]);

  const ready = loaded >= FRAME_COUNT;

  return (
    <div ref={wrapperRef} className="frame-sequence">
      <canvas ref={canvasRef} className="frame-sequence__canvas" />

      {!ready && (
        <div className="frame-sequence__loader">
          <span className="frame-sequence__loader-label">
            LOADING {Math.floor((loaded / FRAME_COUNT) * 100)}%
          </span>
          <div className="frame-sequence__loader-track">
            <div
              className="frame-sequence__loader-fill"
              style={{ width: `${(loaded / FRAME_COUNT) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="frame-sequence__labels">
        {LABELS.map((label, i) => (
          <div
            key={label.text}
            className="callout"
            data-active={activeLabels.includes(i)}
            style={{ top: `${22 + i * 20}%`, left: i % 2 === 0 ? "8%" : undefined, right: i % 2 !== 0 ? "8%" : undefined }}
          >
            <span className="callout__index">{String(i + 1).padStart(2, "0")}</span>
            <span className="callout__leader" />
            <span className="callout__text">
              {label.text}
              <em>{label.sub}</em>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}