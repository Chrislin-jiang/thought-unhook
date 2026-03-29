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
        {theme === 'cosmos' && <CosmosBg />}
        {theme === 'starry' && <StarryBg />}
        {theme === 'ocean' && <OceanBg />}
        {theme === 'forest' && <ForestBg />}
        {theme === 'void' && <VoidBg />}
        {theme === 'theater' && <TheaterBg />}
      </motion.div>
    </AnimatePresence>
  );
}

// ===== 星空主题 — 深邃宇宙 =====
function CosmosBg() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas 绘制密集小星点（远景层）
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    // 远景星点 — 200+ 极细微的点
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 0.8 + 0.2;
      const alpha = Math.random() * 0.5 + 0.1;
      // 多数白色，少量淡蓝/淡金
      const hue = Math.random() > 0.85 ? (Math.random() > 0.5 ? 220 : 40) : 0;
      const sat = hue === 0 ? 0 : 30 + Math.random() * 40;
      const lit = 85 + Math.random() * 15;
      ctx.fillStyle = hue === 0
        ? `rgba(255,255,255,${alpha})`
        : `hsla(${hue},${sat}%,${lit}%,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  // DOM 星点 — 闪烁层（50颗中型星）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stars: HTMLDivElement[] = [];

    for (let i = 0; i < 50; i++) {
      const star = document.createElement('div');
      star.className = 'cosmos-star';
      const size = Math.random() * 2.5 + 0.8;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty('--twinkle-duration', `${Math.random() * 4 + 2}s`);
      star.style.setProperty('--twinkle-peak', `${Math.random() * 0.7 + 0.3}`);
      star.style.animationDelay = `${Math.random() * 6}s`;

      // 少量亮星加十字光芒
      if (size > 2.5) {
        star.classList.add('cosmos-star--bright');
      }

      container.appendChild(star);
      stars.push(star);
    }

    return () => { stars.forEach(s => s.remove()); };
  }, []);

  // Canvas 流星动画
  const meteorCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = meteorCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);

    interface Meteor {
      x: number;
      y: number;
      len: number;
      speed: number;
      angle: number;
      opacity: number;
      phase: 'wait' | 'fly' | 'fade';
      timer: number;
      waitTime: number;
      trail: Array<{ x: number; y: number; alpha: number }>;
    }

    function createMeteor(): Meteor {
      // 从屏幕上方/右侧随机位置出发
      const startX = Math.random() * w * 0.6 + w * 0.3;
      const startY = Math.random() * h * 0.3;
      // 角度 200-240度（从右上往左下划，真实流星方向）
      const angle = (210 + Math.random() * 30) * Math.PI / 180;
      return {
        x: startX,
        y: startY,
        len: 80 + Math.random() * 60,
        speed: 6 + Math.random() * 5,
        angle,
        opacity: 0,
        phase: 'wait',
        timer: 0,
        waitTime: 4000 + Math.random() * 10000,
        trail: [],
      };
    }

    const meteors: Meteor[] = [createMeteor(), createMeteor(), createMeteor()];
    // 错开初始等待
    meteors[0].waitTime = 2000;
    meteors[1].waitTime = 6000;
    meteors[2].waitTime = 12000;

    let animId: number;
    let lastTime = performance.now();

    function update(now: number) {
      const dt = now - lastTime;
      lastTime = now;

      ctx.clearRect(0, 0, w, h);

      for (const m of meteors) {
        if (m.phase === 'wait') {
          m.timer += dt;
          if (m.timer >= m.waitTime) {
            m.phase = 'fly';
            m.timer = 0;
            m.opacity = 1;
            m.trail = [];
            // 重新随机起点
            m.x = Math.random() * w * 0.5 + w * 0.25;
            m.y = Math.random() * h * 0.25;
            m.angle = (210 + Math.random() * 30) * Math.PI / 180;
            m.speed = 6 + Math.random() * 5;
            m.len = 80 + Math.random() * 60;
          }
          continue;
        }

        if (m.phase === 'fly') {
          // 移动头部
          const vx = Math.cos(m.angle) * m.speed;
          const vy = -Math.sin(m.angle) * m.speed; // y轴翻转(向下)
          m.x += vx;
          m.y -= vy;

          // 记录轨迹点
          m.trail.push({ x: m.x, y: m.y, alpha: 1 });

          // 限制尾巴长度
          const maxTrailLen = Math.floor(m.len / m.speed * 2);
          if (m.trail.length > maxTrailLen) {
            m.trail.shift();
          }

          // 轨迹衰减
          for (let i = 0; i < m.trail.length; i++) {
            m.trail[i].alpha = (i / m.trail.length);
          }

          m.timer += dt;
          // 飞行约 600ms 后开始淡出
          if (m.timer > 500) {
            m.opacity = Math.max(0, m.opacity - 0.03);
          }
          if (m.opacity <= 0 || m.x < -50 || m.y > h + 50) {
            m.phase = 'wait';
            m.timer = 0;
            m.waitTime = 5000 + Math.random() * 12000;
          }
        }

        // 绘制流星
        if (m.trail.length > 1 && m.opacity > 0) {
          // 尾巴（渐变线段）
          for (let i = 1; i < m.trail.length; i++) {
            const prev = m.trail[i - 1];
            const curr = m.trail[i];
            const progress = i / m.trail.length;
            const lineWidth = progress * 1.8;
            const alpha = progress * m.opacity * 0.6;

            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(curr.x, curr.y);
            ctx.strokeStyle = `rgba(200, 220, 255, ${alpha})`;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
          }

          // 头部亮点
          const head = m.trail[m.trail.length - 1];
          const headGrad = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 3);
          headGrad.addColorStop(0, `rgba(255, 255, 255, ${m.opacity})`);
          headGrad.addColorStop(0.5, `rgba(200, 220, 255, ${m.opacity * 0.5})`);
          headGrad.addColorStop(1, `rgba(200, 220, 255, 0)`);
          ctx.fillStyle = headGrad;
          ctx.beginPath();
          ctx.arc(head.x, head.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(update);
    }

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div ref={containerRef} className="cosmos-bg">
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />
      <canvas
        ref={meteorCanvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />

      <div className="cosmos-nebula cosmos-nebula--1" />
      <div className="cosmos-nebula cosmos-nebula--2" />
      <div className="cosmos-nebula cosmos-nebula--3" />
    </div>
  );
}

// ===== 墨夜主题 =====
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

    // 海洋生物
    const creatures = ['🪼', '🐠', '🐟', '🦑', '🐡', '🐙'];
    const creatureEls: HTMLDivElement[] = [];

    for (let i = 0; i < 5; i++) {
      const el = document.createElement('div');
      el.className = 'ocean-creature';
      el.textContent = creatures[i % creatures.length];
      const size = 16 + Math.random() * 10;
      el.style.fontSize = `${size}px`;
      el.style.top = `${15 + Math.random() * 65}%`;
      // 从右到左或从左到右随机
      const goLeft = Math.random() > 0.5;
      el.style.setProperty('--swim-from', goLeft ? '110%' : '-15%');
      el.style.setProperty('--swim-to', goLeft ? '-15%' : '110%');
      el.style.setProperty('--swim-duration', `${30 + Math.random() * 40}s`);
      el.style.setProperty('--swim-sway', `${15 + Math.random() * 20}px`);
      el.style.animationDelay = `${i * 8 + Math.random() * 10}s`;
      if (!goLeft) {
        el.style.transform = 'scaleX(-1)';
      }
      container.appendChild(el);
      creatureEls.push(el);
    }

    return () => {
      bubbles.forEach(b => b.remove());
      creatureEls.forEach(c => c.remove());
    };
  }, []);

  return (
    <div ref={containerRef} className="ocean-bg">
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

// ===== 剧场主题 — 帷幕 + 聚光灯 =====
function TheaterBg() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements: HTMLElement[] = [];

    // 金色光尘粒子
    for (let i = 0; i < 20; i++) {
      const dust = document.createElement('div');
      dust.className = 'theater-dust';
      const size = Math.random() * 3 + 1;
      dust.style.width = `${size}px`;
      dust.style.height = `${size}px`;
      dust.style.left = `${10 + Math.random() * 80}%`;
      dust.style.top = `${5 + Math.random() * 70}%`;
      dust.style.setProperty('--float-x', `${(Math.random() - 0.5) * 50}px`);
      dust.style.setProperty('--float-y', `${(Math.random() - 0.5) * 40}px`);
      dust.style.setProperty('--float-duration', `${6 + Math.random() * 8}s`);
      dust.style.animationDelay = `${Math.random() * 8}s`;
      container.appendChild(dust);
      elements.push(dust);
    }

    // 飘落的玫瑰花瓣 — CSS 绘制真实花瓣形状
    const petalColors = [
      // [主色, 边缘色] — 深红/玫红/粉色变化
      ['rgba(180,40,60,0.7)', 'rgba(140,25,45,0.5)'],
      ['rgba(200,60,80,0.65)', 'rgba(160,35,55,0.45)'],
      ['rgba(160,30,50,0.7)', 'rgba(120,20,40,0.5)'],
      ['rgba(190,50,70,0.6)', 'rgba(150,30,50,0.4)'],
      ['rgba(210,70,90,0.55)', 'rgba(170,45,65,0.35)'],
      ['rgba(170,35,55,0.7)', 'rgba(130,22,42,0.5)'],
    ];
    for (let i = 0; i < 15; i++) {
      const petal = document.createElement('div');
      petal.className = 'theater-petal';
      const colors = petalColors[i % petalColors.length];
      const w = 8 + Math.random() * 8;   // 8-16px 宽
      const h = w * (1.2 + Math.random() * 0.4); // 略长于宽
      petal.style.width = `${w}px`;
      petal.style.height = `${h}px`;
      petal.style.background = `radial-gradient(ellipse at 30% 30%, ${colors[0]}, ${colors[1]} 70%, transparent 100%)`;
      petal.style.left = `${3 + Math.random() * 94}%`;
      petal.style.setProperty('--petal-duration', `${9 + Math.random() * 14}s`);
      petal.style.setProperty('--petal-sway', `${(Math.random() - 0.5) * 120}px`);
      petal.style.setProperty('--petal-rotate', `${Math.random() * 720 - 360}deg`);
      petal.style.setProperty('--petal-init-rotate', `${Math.random() * 360}deg`);
      petal.style.animationDelay = `${Math.random() * 16}s`;
      container.appendChild(petal);
      elements.push(petal);
    }

    // 点缀几朵完整的 🌹 — 和其他emoji道具一样横向飘过
    for (let i = 0; i < 2; i++) {
      const rose = document.createElement('div');
      rose.className = 'theater-prop';
      rose.textContent = '🌹';
      rose.style.top = `${25 + Math.random() * 45}%`;
      rose.style.fontSize = `${14 + Math.random() * 5}px`;
      const goLeft = Math.random() > 0.5;
      rose.style.setProperty('--prop-from', goLeft ? '105%' : '-10%');
      rose.style.setProperty('--prop-to', goLeft ? '-10%' : '105%');
      rose.style.setProperty('--prop-duration', `${35 + Math.random() * 25}s`);
      rose.style.setProperty('--prop-bob', `${8 + Math.random() * 12}px`);
      rose.style.animationDelay = `${8 + i * 18 + Math.random() * 10}s`;
      container.appendChild(rose);
      elements.push(rose);
    }

    // 剧场道具 — 缓慢飘过的符号
    const props = ['🎭', '🎪', '🎩', '🎻', '📜', '🪄'];
    for (let i = 0; i < 3; i++) {
      const prop = document.createElement('div');
      prop.className = 'theater-prop';
      prop.textContent = props[i % props.length];
      prop.style.top = `${20 + Math.random() * 50}%`;
      prop.style.fontSize = `${16 + Math.random() * 8}px`;
      const goLeft = Math.random() > 0.5;
      prop.style.setProperty('--prop-from', goLeft ? '105%' : '-10%');
      prop.style.setProperty('--prop-to', goLeft ? '-10%' : '105%');
      prop.style.setProperty('--prop-duration', `${40 + Math.random() * 30}s`);
      prop.style.setProperty('--prop-bob', `${10 + Math.random() * 15}px`);
      prop.style.animationDelay = `${i * 12 + Math.random() * 8}s`;
      container.appendChild(prop);
      elements.push(prop);
    }

    return () => {
      elements.forEach(el => el.remove());
    };
  }, []);

  return (
    <div ref={containerRef} className="theater-bg">
      {/* 顶部帷幕横幅 */}
      <div className="theater-valance" />

      {/* 帷幕褶皱纹理 */}
      <div className="theater-curtain theater-curtain--left" />
      <div className="theater-curtain theater-curtain--right" />

      {/* 聚光灯 */}
      <div className="theater-spotlight theater-spotlight--1" />
      <div className="theater-spotlight theater-spotlight--2" />
      <div className="theater-spotlight theater-spotlight--3" />

      {/* 舞台地板 + 反光 */}
      <div className="theater-stage" />
      <div className="theater-stage-glow" />
    </div>
  );
}
