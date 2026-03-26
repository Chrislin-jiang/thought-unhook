/**
 * App 主组件 — Phase 0 极简验证
 * 
 * 单页面，无路由。核心功能：
 * 1. 念头输入
 * 2. 气泡物化 + AI分类
 * 3. 三种解钩操作：改写 / 变声 / 吹走
 */

import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import StarryBackground from './components/StarryBackground';
import Header from './components/Header';
import ThoughtSpace from './components/ThoughtSpace';
import ThoughtInput from './components/ThoughtInput';
import ActionPanel from './components/ActionPanel';
import { useThoughtStore } from './store';
import { preloadVoices } from './ai-service';

export default function App() {
  const selectedId = useThoughtStore(s => s.selectedThoughtId);
  const thoughts = useThoughtStore(s => s.thoughts);
  const hasActive = thoughts.some(t => t.status === 'active');

  useEffect(() => {
    // 预加载TTS语音
    preloadVoices();
    // 有些浏览器需要交互后才能获取语音列表
    const handler = () => preloadVoices();
    window.addEventListener('click', handler, { once: true });
    return () => window.removeEventListener('click', handler);
  }, []);

  return (
    <div className="h-screen flex flex-col relative" style={{ background: '#0a0a1a', minHeight: '100dvh' }}>
      {/* 星空背景 */}
      <StarryBackground />

      {/* 顶部 */}
      <Header />

      {/* 念头空间 — 气泡漂浮区域 */}
      <ThoughtSpace />

      {/* 底部操作区 */}
      <div className="relative z-10 px-4 pb-5 space-y-3">
        {/* 选中气泡时显示操作面板 */}
        <AnimatePresence>
          {selectedId && hasActive && <ActionPanel />}
        </AnimatePresence>

        {/* 输入区 */}
        <ThoughtInput />
      </div>
    </div>
  );
}
