/**
 * 顶部导航 — 极简
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
      <div className="flex items-center gap-2">
        <span className="text-base">{current.emoji}</span>
        <h1
          className="text-sm"
          style={{ color: 'rgba(200,200,230,0.7)', fontSize: '14px', fontWeight: 400 }}
        >
          {current.title}
        </h1>
      </div>

      <div className="flex items-center gap-1.5">
        {currentPage === 'journal' && thoughts.length > 0 && (
          <motion.button
            onClick={() => setShowSharePanel(true)}
            whileTap={{ scale: 0.92 }}
            className="px-2 py-1 rounded-md"
            style={{
              background: 'rgba(200,200,230,0.04)',
              color: 'rgba(200,200,230,0.35)',
              fontSize: '10px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              border: 'none',
            }}
          >
            分享
          </motion.button>
        )}

        <motion.button
          onClick={() => setShowAISettings(true)}
          whileTap={{ scale: 0.92 }}
          className="relative px-2 py-1 rounded-md"
          style={{
            background: aiEnabled
              ? 'rgba(139,124,247,0.06)'
              : 'rgba(200,200,230,0.04)',
            color: aiEnabled ? 'rgba(139,124,247,0.6)' : 'rgba(200,200,230,0.25)',
            fontSize: '10px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            border: 'none',
          }}
        >
          AI
          {aiEnabled && (
            <span
              className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full"
              style={{ background: '#7cc5a8' }}
            />
          )}
        </motion.button>

        <ThemeSelector />
      </div>

      <AISettingsPanel isOpen={showAISettings} onClose={() => setShowAISettings(false)} />
    </motion.header>
  );
}
