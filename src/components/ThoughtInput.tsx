/**
 * 念头输入区 — 柔和治愈风
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThoughtStore } from '../store';
import VoiceInput from './VoiceInput';

const PLACEHOLDER_TEXTS = [
  '脑子里在上演什么...',
  '今天的剧本写了什么...',
  '哪个角色又在念台词...',
  '记录这出戏的台词...',
  '舞台上正在发生什么...',
];

export default function ThoughtInput() {
  const [text, setText] = useState('');
  const [placeholder] = useState(
    () => PLACEHOLDER_TEXTS[Math.floor(Math.random() * PLACEHOLDER_TEXTS.length)]
  );
  const [justAdded, setJustAdded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const addThought = useThoughtStore(s => s.addThought);
  const todayCount = useThoughtStore(s => s.getTodayCount());

  const handleVoiceResult = useCallback((voiceText: string) => {
    setText(prev => {
      const separator = prev.trim() ? ' ' : '';
      return prev + separator + voiceText;
    });
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    setTimeout(() => textareaRef.current?.focus(), 500);
  }, []);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    await addThought(trimmed);
    setText('');
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="input-area relative z-10">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          maxLength={200}
          className="w-full pr-20"
          style={{ minHeight: '48px' }}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          <motion.button
            onClick={handleSubmit}
            className="w-9 h-9 flex items-center justify-center rounded-full"
            style={{
              background: text.trim()
                ? 'linear-gradient(135deg, #8B7CF7, #A78BFA)'
                : 'rgba(139,124,247,0.08)',
              cursor: text.trim() ? 'pointer' : 'default',
              color: text.trim() ? '#fff' : 'rgba(139,124,247,0.3)',
              boxShadow: text.trim() ? '0 4px 12px rgba(139,124,247,0.25)' : 'none',
              transition: 'all 0.25s ease',
              border: 'none',
            }}
            whileHover={text.trim() ? { scale: 1.1 } : {}}
            whileTap={text.trim() ? { scale: 0.9 } : {}}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </motion.button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1.5 px-1">
        <AnimatePresence mode="wait">
          {justAdded ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs font-medium"
              style={{ color: '#4ECDC4' }}
            >
              ✓ 台词已记录
            </motion.span>
          ) : (
            <motion.span
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs"
              style={{ color: 'var(--text-hint)' }}
            >
              按 Enter 记录
            </motion.span>
          )}
        </AnimatePresence>

        {todayCount > 0 && (
          <span className="text-xs" style={{ color: 'var(--text-hint)' }}>
            今日 {todayCount} 场戏
          </span>
        )}
      </div>
    </div>
  );
}
