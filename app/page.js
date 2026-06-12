"use client";

import { useState, useEffect, useCallback } from "react";

const SLOGANS = [
  "We don't follow playbooks. We build them.",
  "Your idea deserves an architect.",
  "Stop planning. Start building.",
];

const WHATSAPP_URL = "https://wa.me/PHONE_NUMBER";

export default function HeroPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animClass, setAnimClass] = useState("slogan-enter");

  const cycleSlogans = useCallback(() => {
    // exit current
    setAnimClass("slogan-exit");

    const exitTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % SLOGANS.length);
      setAnimClass("slogan-enter");
    }, 400); // match slogan-glitch-out duration

    return () => clearTimeout(exitTimer);
  }, []);

  useEffect(() => {
    const interval = setInterval(cycleSlogans, 3000);
    return () => clearInterval(interval);
  }, [cycleSlogans]);

  return (
    <main className="scanlines relative flex h-screen w-full items-center justify-center overflow-hidden bg-black">
      {/* Ambient glow */}
      <div className="glow-pulse" />

      {/* Content stack */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center md:gap-10">
        {/* ── Brand name ─────────────────────────────── */}
        <h1
          className="glitch"
          data-text="ARCHYTER"
          style={{
            fontSize: "clamp(4rem, 10vw, 10rem)",
            lineHeight: 1,
            color: "#fff",
          }}
        >
          ARCHYTER
        </h1>

        {/* ── Rotating slogan ────────────────────────── */}
        <p
          key={currentIndex}
          className={animClass}
          style={{
            fontSize: "clamp(0.85rem, 2vw, 1.35rem)",
            color: "#fff",
            letterSpacing: "0.06em",
            minHeight: "2em",
          }}
        >
          {SLOGANS[currentIndex]}
        </p>

        {/* ── Contact button ─────────────────────────── */}
        <a
          id="contact-button"
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-glitch"
        >
          Contact Us
        </a>
      </div>
    </main>
  );
}
