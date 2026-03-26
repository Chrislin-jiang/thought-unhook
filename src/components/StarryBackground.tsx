/**
 * 星空背景组件
 */

import { useEffect, useRef } from 'react';

export default function StarryBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 生成随机星星
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
