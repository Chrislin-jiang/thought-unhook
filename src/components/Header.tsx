/**
 * 顶部导航 — 柔和治愈风
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
    space:   { emoji: '🎭', title: '内心剧场' },
    journal: { emoji: '📊', title: '演出记录' },
    lab:     { emoji: '🧪', title: '出戏练习' },
    night:   { emoji: '🌙', title: '散场时分' },
  };

  const current = pageConfig[currentPage] || { emoji: '🎭', title: '出戏' };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-30 px-5 pt-5 pb-3 flex items-center justify-between"
    >
      {/* 左侧标题 */}
      <div className="flex items-center gap-2.5">
        <motion.span
          className="text-xl"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {current.emoji}
        </motion.span>
        <h1
          className="text-base font-medium"
          style={{ color: 'var(--text-primary)', letterSpacing: '0.5px' }}
        >
          {current.title}
        </h1>
      </div>

      {/* 右侧按钮 */}
      <div className="flex items-center gap-2">
        {currentPage === 'journal' && thoughts.length > 0 && (
          <motion.button
            onClick={() => setShowSharePanel(true)}
            whileTap={{ scale: 0.92 }}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: 'rgba(139,124,247,0.08)',
              border: '1.5px solid rgba(139,124,247,0.15)',
              color: '#8B7CF7',
              cursor: 'pointer',
            }}
          >
            📤 分享
          </motion.button>
        )}

        <motion.button
          onClick={() => setShowAISettings(true)}
          whileTap={{ scale: 0.92 }}
          className="relative px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: aiEnabled
              ? 'rgba(139,124,247,0.1)'
              : 'rgba(139,124,247,0.04)',
            border: `1.5px solid ${aiEnabled ? 'rgba(139,124,247,0.25)' : 'rgba(139,124,247,0.1)'}`,
            color: aiEnabled ? '#8B7CF7' : 'rgba(45,43,85,0.4)',
            cursor: 'pointer',
          }}
        >
          🧠 AI
          {aiEnabled && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
              style={{ background: '#4ECDC4', boxShadow: '0 0 6px rgba(78,205,196,0.4)' }}
            />
          )}
        </motion.button>

        <ThemeSelector />
      </div>

      <AISettingsPanel isOpen={showAISettings} onClose={() => setShowAISettings(false)} />
    </motion.header>
  );
}
