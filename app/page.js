"use client";

import { useState, useEffect, useRef } from "react";

const SLOGANS = [
  "We don't follow playbooks. We build them.",
  "Your idea deserves an architect.",
  "Stop planning. Start building.",
];

const WHATSAPP_URL = "https://wa.me/PHONE_NUMBER";

export default function HeroPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animClass, setAnimClass] = useState("slogan-enter");

  const mouseRef = useRef({ x: 0, y: 0 });
  const glowRef = useRef(null);
  const titleRef = useRef(null);
  const letterRefs = useRef([]);
  const buttonRef = useRef(null);
  const isTouchDevice = useRef(false);

  // 1. Performance-optimized animation loop with cached layout bounds to avoid layout thrashing
  useEffect(() => {
    isTouchDevice.current =
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window;

    const cachedLetters = [];
    let cachedTitleRect = null;
    let cachedButtonRect = null;
    const letterStates = [];
    const buttonState = { x: 0, y: 0 };
    let loopRunning = false;

    const updateCache = () => {
      if (titleRef.current) {
        const rect = titleRef.current.getBoundingClientRect();
        cachedTitleRect = {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
      }

      if (letterRefs.current.length > 0) {
        cachedLetters.length = 0;
        letterRefs.current.forEach((letterEl) => {
          if (!letterEl) return;
          const rect = letterEl.getBoundingClientRect();
          cachedLetters.push({
            el: letterEl,
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            width: rect.width,
            height: rect.height,
          });
        });

        // Initialize or adjust states array size
        while (letterStates.length < cachedLetters.length) {
          letterStates.push({ x: 0, y: 0, scale: 1, force: 0 });
        }
      }

      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        cachedButtonRect = {
          el: buttonRef.current,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
        };
      }
    };

    const tick = () => {
      if (!loopRunning) return;

      const mouse = mouseRef.current;
      const hasMouse = mouse.x !== 0 || mouse.y !== 0;

      // a. Update Letters Physics
      let lettersAnimating = false;
      if (cachedTitleRect && cachedLetters.length > 0) {
        const isNearTitle =
          hasMouse &&
          mouse.x >= cachedTitleRect.left - 150 &&
          mouse.x <=
            cachedTitleRect.right -
              150 +
              (cachedTitleRect.right - cachedTitleRect.left) +
              150 &&
          mouse.y >= cachedTitleRect.top - 120 &&
          mouse.y <= cachedTitleRect.bottom + 120;

        cachedLetters.forEach((letter, i) => {
          let targetX = 0;
          let targetY = 0;
          let targetScale = 1;
          let targetForce = 0;

          if (isNearTitle) {
            const dx = mouse.x - letter.x;
            const dy = mouse.y - letter.y;
            const sigma = 80;
            const factor = Math.exp(-Math.pow(dx / sigma, 2));
            const yDecay = Math.max(0, 1 - Math.abs(dy) / 110);
            const force = factor * yDecay;

            targetX = dx * force * 0.15;
            targetY = -15 * force;
            targetScale = 1 + force * 0.08;
            targetForce = force;
          }

          const state = letterStates[i];
          if (!state) return;

          // Lerp masuk cepat saat ada force, keluar cepat saat kembali ke rest
          const isActive = targetForce > 0.01;
          const lerpFactor = isActive ? 0.42 : 0.35;
          state.x += (targetX - state.x) * lerpFactor;
          state.y += (targetY - state.y) * lerpFactor;
          state.scale += (targetScale - state.scale) * lerpFactor;
          state.force += (targetForce - state.force) * lerpFactor;

          // Apply transforms
          letter.el.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`;

          // Smooth color & glow classes
          if (state.force > 0.12) {
            letter.el.classList.add("letter-glow");
          } else {
            letter.el.classList.remove("letter-glow");
          }

          // Check if letter is still moving
          if (
            Math.abs(state.x) > 0.05 ||
            Math.abs(state.y) > 0.05 ||
            Math.abs(state.scale - 1) > 0.005 ||
            state.force > 0.01
          ) {
            lettersAnimating = true;
          }
        });
      }

      // b. Update Magnetic Button Pull
      let buttonAnimating = false;
      if (cachedButtonRect) {
        let targetBtnX = 0;
        let targetBtnY = 0;

        if (hasMouse) {
          const dx = mouse.x - cachedButtonRect.x;
          const dy = mouse.y - cachedButtonRect.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 130;

          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            targetBtnX = dx * force * 0.22;
            targetBtnY = dy * force * 0.22;
          }
        }

        const isActive =
          Math.abs(targetBtnX) > 0.01 || Math.abs(targetBtnY) > 0.01;
        const lerpFactor = isActive ? 0.38 : 0.32;
        buttonState.x += (targetBtnX - buttonState.x) * lerpFactor;
        buttonState.y += (targetBtnY - buttonState.y) * lerpFactor;

        cachedButtonRect.el.style.transform = `translate3d(${buttonState.x}px, ${buttonState.y}px, 0)`;

        if (Math.abs(buttonState.x) > 0.05 || Math.abs(buttonState.y) > 0.05) {
          buttonAnimating = true;
        }
      }

      // c. Update Ambient Mouse Glow
      if (glowRef.current && hasMouse) {
        const currentGlowX =
          parseFloat(glowRef.current.style.left) || window.innerWidth / 2;
        const currentGlowY =
          parseFloat(glowRef.current.style.top) || window.innerHeight / 2;
        const glowLerp = 0.2;
        const nextGlowX = currentGlowX + (mouse.x - currentGlowX) * glowLerp;
        const nextGlowY = currentGlowY + (mouse.y - currentGlowY) * glowLerp;
        glowRef.current.style.left = `${nextGlowX}px`;
        glowRef.current.style.top = `${nextGlowY}px`;
      }

      // Keep animation loop ticking if there are active movements or mouse is active
      if (lettersAnimating || buttonAnimating || hasMouse) {
        requestAnimationFrame(tick);
      } else {
        loopRunning = false;
      }
    };

    const startLoop = () => {
      if (loopRunning) return;
      loopRunning = true;
      requestAnimationFrame(tick);
    };

    // Initialize layout cache
    updateCache();

    // Cache adjustments on delays for font rendering
    const t1 = setTimeout(updateCache, 400);
    const t2 = setTimeout(updateCache, 1200);

    const handleResize = () => {
      updateCache();
    };

    const handleMouseMove = (e) => {
      if (isTouchDevice.current) return;
      if (cachedLetters.length === 0) {
        updateCache();
      }
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      startLoop();
    };

    const handleTouchMove = (e) => {
      if (!e.touches[0]) return;
      const touch = e.touches[0];
      mouseRef.current.x = touch.clientX;
      mouseRef.current.y = touch.clientY;
      startLoop();
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = 0;
      mouseRef.current.y = 0;
      startLoop(); // Trigger tick to smoothly return elements to rest positions
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // 2. Slogan Cycles
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimClass("slogan-exit");
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % SLOGANS.length);
        setAnimClass("slogan-enter");
      }, 500);

      return () => clearTimeout(timer);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[var(--color-bg-cream)]">
      {/* Paper Grain Overlay */}
      <div className="grain-overlay" />

      {/* Editorial Vignette Overlay */}
      <div className="vignette-overlay" />

      {/* Floating Warm Shapes (CSS only — replaces canvas dust) */}
      <div className="warm-shapes">
        <div className="warm-shape warm-shape--1" />
        <div className="warm-shape warm-shape--2" />
        <div className="warm-shape warm-shape--3" />
      </div>

      {/* Architectural Blueprint Grid */}
      <div className="blueprint-grid" />

      {/* Ambient Mouse Gold Glow */}
      <div
        ref={glowRef}
        className="cursor-glow"
        style={{ left: "50%", top: "45%" }}
      />

      {/* Foreground Content Stack */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-6 text-center md:gap-12">
        {/* Editorial serif title with interactive staggered letter wave */}
        <h1
          ref={titleRef}
          className="interactive-title"
          style={{
            fontSize: "clamp(3.2rem, 9.5vw, 8.5rem)",
            lineHeight: 1.1,
          }}
        >
          {Array.from("ARCHYTER").map((char, index) => (
            <span
              key={index}
              ref={(el) => (letterRefs.current[index] = el)}
              className="stagger-letter"
              style={{
                transitionDelay: `${index * 15}ms`,
                animationDelay: `${index * 60 + 100}ms`,
              }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Gold Accent Line */}
        <div className="accent-line" />

        {/* Smooth Slogan Rotating Display */}
        <div
          style={{
            minHeight: "3rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p
            key={currentIndex}
            className={animClass}
            style={{
              fontSize: "clamp(0.9rem, 2.2vw, 1.25rem)",
              letterSpacing: "0.08em",
              color: "var(--color-text-muted)",
              fontWeight: 300,
              maxWidth: "600px",
            }}
          >
            {SLOGANS[currentIndex]}
          </p>
        </div>

        {/* CTA Button */}
        <a
          id="contact-button"
          ref={buttonRef}
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="premium-btn"
        >
          Contact Us
          <span className="premium-btn-arrow">→</span>
        </a>
      </div>
    </main>
  );
}
