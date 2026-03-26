/**
 * 多主题背景组件 — Phase 3
 * 支持4种主题：星空 / 海底 / 森林 / 虚空白
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ThemeType } from '../types';

interface Props {
  theme: ThemeType;
}

export default function ThemeBackground({ theme }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        key={theme}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {theme === 'starry' && <StarryBg />}
        {theme === 'ocean' && <OceanBg />}
        {theme === 'forest' && <ForestBg />}
        {theme === 'void' && <VoidBg />}
      </motion.div>
    </AnimatePresence>
  );
}

// ===== 星空主题 =====
function StarryBg() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const starCount = 80;
    const stars: HTMLDivElement[] = [];

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() * 2.5 + 0.5;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty('--duration', `${Math.random() * 4 + 2}s`);
      star.style.setProperty('--max-opacity', `${Math.random() * 0.6 + 0.2}`);
      star.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(star);
      stars.push(star);
    }

    return () => {
      stars.forEach(s => s.remove());
    };
  }, []);

  return <div ref={containerRef} className="stars-bg" />;
}

// ===== 海底主题 =====
function OceanBg() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const bubbleCount = 25;
    const bubbles: HTMLDivElement[] = [];

    for (let i = 0; i < bubbleCount; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'ocean-bubble';
      const size = Math.random() * 8 + 3;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${Math.random() * 100}%`;
      bubble.style.bottom = `-${size}px`;
      bubble.style.setProperty('--rise-duration', `${Math.random() * 8 + 6}s`);
      bubble.style.setProperty('--sway', `${(Math.random() - 0.5) * 40}px`);
      bubble.style.animationDelay = `${Math.random() * 10}s`;
      container.appendChild(bubble);
      bubbles.push(bubble);
    }

    return () => {
      bubbles.forEach(b => b.remove());
    };
  }, []);

  return (
    <div ref={containerRef} className="ocean-bg">
      {/* 光线效果 */}
      <div className="ocean-light ocean-light-1" />
      <div className="ocean-light ocean-light-2" />
      <div className="ocean-light ocean-light-3" />
    </div>
  );
}

// ===== 森林主题 =====
function ForestBg() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 萤火虫
    const fireflyCount = 20;
    const fireflies: HTMLDivElement[] = [];

    for (let i = 0; i < fireflyCount; i++) {
      const firefly = document.createElement('div');
      firefly.className = 'forest-firefly';
      const size = Math.random() * 4 + 2;
      firefly.style.width = `${size}px`;
      firefly.style.height = `${size}px`;
      firefly.style.left = `${Math.random() * 100}%`;
      firefly.style.top = `${Math.random() * 100}%`;
      firefly.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 60}px`);
      firefly.style.setProperty('--drift-y', `${(Math.random() - 0.5) * 40}px`);
      firefly.style.setProperty('--glow-duration', `${Math.random() * 3 + 2}s`);
      firefly.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(firefly);
      fireflies.push(firefly);
    }

    // 落叶
    const leafCount = 8;
    const leaves: HTMLDivElement[] = [];
    for (let i = 0; i < leafCount; i++) {
      const leaf = document.createElement('div');
      leaf.className = 'forest-leaf';
      leaf.innerHTML = ['🍃', '🌿', '🍂'][i % 3];
      leaf.style.left = `${Math.random() * 100}%`;
      leaf.style.top = `-20px`;
      leaf.style.setProperty('--fall-duration', `${Math.random() * 10 + 12}s`);
      leaf.style.setProperty('--sway-amount', `${(Math.random() - 0.5) * 100}px`);
      leaf.style.animationDelay = `${Math.random() * 15}s`;
      container.appendChild(leaf);
      leaves.push(leaf);
    }

    return () => {
      fireflies.forEach(f => f.remove());
      leaves.forEach(l => l.remove());
    };
  }, []);

  return (
    <div ref={containerRef} className="forest-bg">
      <div className="forest-mist" />
    </div>
  );
}

// ===== 暖夜主题 =====
function VoidBg() {
  return (
    <div className="void-bg">
      {/* 暖光渐变圆 */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="void-circle"
          style={{
            left: `${20 + i * 30}%`,
            top: `${30 + (i % 2) * 20}%`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.06, 0.12, 0.06],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
        />
      ))}
      {/* 微小暖色光点 */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`spark-${i}`}
          style={{
            position: 'absolute',
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(220,180,100,${0.4 + Math.random() * 0.3}) 0%, transparent 70%)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 6,
          }}
        />
      ))}
    </div>
  );
}
