/**
 * 顶部导航 — 赛博科技风
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useThoughtStore } from '../store';
import ThemeSelector from './ThemeSelector';
import AISettingsPanel from './AISettingsPanel';
import { isLLMEnabled } from '../llm-client';

export default function Header() {
  const thoughts = useThoughtStore(s => s.thoughts);
  const currentPage = useThoughtStore(s => s.currentPage);
  const setShowSharePanel = useThoughtStore(s => s.setShowSharePanel);
  const [showAISettings, setShowAISettings] = useState(false);

  const aiEnabled = isLLMEnabled();

  const pageConfig: Record<string, { emoji: string; title: string }> = {
    space:   { emoji: '🫧', title: '念头空间' },
    journal: { emoji: '📊', title: '觉察日志' },
    lab:     { emoji: '🧪', title: '解钩实验室' },
    night:   { emoji: '🌙', title: '睡前模式' },
  };

  const current = pageConfig[currentPage] || { emoji: '🫧', title: '念头解钩器' };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-30 px-5 pt-5 pb-2 flex items-center justify-between"
    >
      {/* 左侧标题 */}
      <div className="flex items-center gap-2.5">
        <span className="text-base">{current.emoji}</span>
        <div className="flex items-center gap-1.5">
          {/* <div
            className="w-1 h-4 rounded-sm"
            style={{ background: 'linear-gradient(180deg, #00f0ff, rgba(0,240,255,0.2))' }}
          /> */}
          <h1
            className="font-mono text-sm tracking-wider"
            style={{ color: 'rgba(0,240,255,0.8)', fontSize: '13px', fontWeight: 500 }}
          >
            {current.title}
          </h1>
        </div>
      </div>

      {/* 右侧按钮 */}
      <div className="flex items-center gap-1.5">
        {currentPage === 'journal' && thoughts.length > 0 && (
          <motion.button
            onClick={() => setShowSharePanel(true)}
            whileTap={{ scale: 0.92 }}
            className="px-2.5 py-1 rounded-xl font-mono"
            style={{
              background: 'rgba(0,240,255,0.04)',
              border: '1px solid rgba(0,240,255,0.12)',
              color: 'rgba(0,240,255,0.5)',
              fontSize: '10px',
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            📤 SHARE
          </motion.button>
        )}

        <motion.button
          onClick={() => setShowAISettings(true)}
          whileTap={{ scale: 0.92 }}
          className="relative px-2.5 py-1 rounded-xl font-mono"
          style={{
            background: aiEnabled
              ? 'rgba(0,240,255,0.06)'
              : 'rgba(0,240,255,0.02)',
            border: `1px solid ${aiEnabled ? 'rgba(0,240,255,0.25)' : 'rgba(0,240,255,0.08)'}`,
            color: aiEnabled ? 'rgba(0,240,255,0.7)' : 'rgba(200,220,240,0.3)',
            fontSize: '10px',
            cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          🧠 AI
          {aiEnabled && (
            <span
              className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
              style={{ background: '#00ff88', boxShadow: '0 0 4px #00ff88' }}
            />
          )}
        </motion.button>

        <ThemeSelector />
      </div>

      <AISettingsPanel isOpen={showAISettings} onClose={() => setShowAISettings(false)} />
    </motion.header>
  );
}
