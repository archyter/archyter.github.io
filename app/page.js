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
  const mouseHasMoved = useRef(false);
  const followerCoords = useRef({ x: 0, y: 0 });

  const glowRef = useRef(null);
  const followerRef = useRef(null);
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const letterRefs = useRef([]);
  const buttonRef = useRef(null);
  const isTouchDevice = useRef(false);

  // 1. Mouse/Touch Coordinates & Magnetic Physics
  useEffect(() => {
    isTouchDevice.current = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;

    const handleMouseMove = (e) => {
      // Flag first movement to reveal the cursor follower
      if (!mouseHasMoved.current) {
        mouseHasMoved.current = true;
        if (followerRef.current) {
          followerRef.current.style.display = "block";
        }
      }

      // Update coordinates
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      // Track ambient glow position
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }

      // Skip dynamic physics offsets on touch screens
      if (isTouchDevice.current) return;

      const mouseX = e.clientX;
      const mouseY = e.clientY;
      let anyHovered = false;

      // Gaussian Letter Wave Physics on Title
      const titleRect = titleRef.current?.getBoundingClientRect();
      const isNearTitle = titleRect && 
        mouseX >= titleRect.left - 150 && 
        mouseX <= titleRect.right + 150 && 
        mouseY >= titleRect.top - 120 && 
        mouseY <= titleRect.bottom + 120;

      letterRefs.current.forEach((letterEl) => {
        if (!letterEl) return;
        const rect = letterEl.getBoundingClientRect();
        const letterCenterX = rect.left + rect.width / 2;
        const letterCenterY = rect.top + rect.height / 2;

        const dx = mouseX - letterCenterX;
        const dy = mouseY - letterCenterY;

        if (isNearTitle) {
          // Sigma determines the width of the bell curve (displacement wave)
          const sigma = 80;
          const factor = Math.exp(-Math.pow(dx / sigma, 2));
          // Decays based on vertical distance
          const yDecay = Math.max(0, 1 - Math.abs(dy) / 110);
          
          const force = factor * yDecay;
          const pullX = dx * force * 0.15;
          const pullY = -15 * force; // Lift up

          letterEl.style.transform = `translate3d(${pullX}px, ${pullY}px, 0) scale(${1 + force * 0.08})`;
          
          if (force > 0.12) {
            letterEl.style.color = "var(--color-gold-accent)";
            anyHovered = true;
          } else {
            letterEl.style.color = "";
          }
        } else {
          letterEl.style.transform = "translate3d(0, 0, 0) scale(1)";
          letterEl.style.color = "";
        }
      });

      // Magnetic Button Pull
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;

        const dx = mouseX - btnCenterX;
        const dy = mouseY - btnCenterY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const maxDist = 130;
        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          const pullX = dx * force * 0.22;
          const pullY = dy * force * 0.22;

          buttonRef.current.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;
          
          // Expand cursor ring if hovering button directly
          if (dist < rect.width / 2 + 15) {
            anyHovered = true;
          }
        } else {
          buttonRef.current.style.transform = "translate3d(0, 0, 0)";
        }
      }

      // Update Cursor Follower ring size based on hover flags
      if (followerRef.current) {
        if (anyHovered) {
          followerRef.current.classList.add("hovering");
        } else {
          followerRef.current.classList.remove("hovering");
        }
      }
    };

    const handleTouchMove = (e) => {
      if (!e.touches[0]) return;
      const touch = e.touches[0];
      mouseRef.current.x = touch.clientX;
      mouseRef.current.y = touch.clientY;

      if (glowRef.current) {
        glowRef.current.style.left = `${touch.clientX}px`;
        glowRef.current.style.top = `${touch.clientY}px`;
      }
    };

    // Reset offsets when cursor leaves viewport
    const handleMouseLeave = () => {
      mouseRef.current.x = 0;
      mouseRef.current.y = 0;

      letterRefs.current.forEach((letterEl) => {
        if (!letterEl) return;
        letterEl.style.transform = "translate3d(0, 0, 0) scale(1)";
        letterEl.style.color = "";
      });

      if (buttonRef.current) {
        buttonRef.current.style.transform = "translate3d(0, 0, 0)";
      }

      if (followerRef.current) {
        followerRef.current.classList.remove("hovering");
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // 2. Particles & Follower Ring Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Golden Particles
    const particlesCount = 45;
    const particles = [];
    for (let i = 0; i < particlesCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25 - 0.1, // Soft upward drift
        size: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.4 + 0.15,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const m = mouseRef.current;

      // 2a. Update Cursor follower ring position with spring damping
      if (!isTouchDevice.current && followerRef.current && mouseHasMoved.current) {
        followerCoords.current.x += (m.x - followerCoords.current.x) * 0.14;
        followerCoords.current.y += (m.y - followerCoords.current.y) * 0.14;
        followerRef.current.style.left = `${followerCoords.current.x}px`;
        followerRef.current.style.top = `${followerCoords.current.y}px`;
      }

      // 2b. Move and Draw Particles
      particles.forEach((p) => {
        // Mouse repulsion
        if (m.x && m.y) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelDist = 160;

          if (dist < repelDist) {
            const force = (repelDist - dist) / repelDist;
            const angle = Math.atan2(dy, dx);
            // Push away
            p.x += Math.cos(angle) * force * 1.6;
            p.y += Math.sin(angle) * force * 1.6;
          }
        }

        // Apply drift
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(197, 162, 106, ${p.alpha})`;
        ctx.fill();
      });

      // 2c. Constellation lines: link nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxLinkDist = 80;

          if (dist < maxLinkDist) {
            const opacity = (1 - dist / maxLinkDist) * 0.055;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(197, 162, 106, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 3. Slogan Cycles
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimClass("slogan-exit");
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % SLOGANS.length);
        setAnimClass("slogan-enter");
      }, 500); // Matches globals.css keyframe transition duration

      return () => clearTimeout(timer);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[var(--color-bg-cream)]">
      {/* Custom spring cursor follower ring */}
      <div ref={followerRef} className="cursor-follower" />

      {/* Paper Grain Overlay */}
      <div className="grain-overlay" />

      {/* Editorial Vignette Overlay */}
      <div className="vignette-overlay" />

      {/* Architectural Blueprint Grid */}
      <div className="blueprint-grid" />

      {/* Gold Dust Background Canvas */}
      <canvas ref={canvasRef} className="background-canvas" />

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
              style={{ transitionDelay: `${index * 15}ms` }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* Smooth Slogan Rotating Display */}
        <div style={{ minHeight: "3rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
