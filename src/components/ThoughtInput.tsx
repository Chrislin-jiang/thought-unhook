/**
 * 念头输入区组件 — Phase 1
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThoughtStore } from '../store';

const PLACEHOLDER_TEXTS = [
  '脑子里在想什么？写下来...',
  '此刻有什么念头在转？',
  '把那个声音写出来...',
  '现在最大声的那个想法是什么？',
  '脑内弹幕是什么？',
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
          className="w-full pr-14"
          style={{ minHeight: '56px' }}
        />

        <motion.button
          onClick={handleSubmit}
          className="absolute right-3 bottom-3 w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: text.trim()
              ? 'linear-gradient(135deg, rgba(139,120,255,0.8), rgba(100,180,255,0.8))'
              : 'rgba(255,255,255,0.08)',
            border: 'none',
            cursor: text.trim() ? 'pointer' : 'default',
            color: text.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
          }}
          whileHover={text.trim() ? { scale: 1.1 } : {}}
          whileTap={text.trim() ? { scale: 0.9 } : {}}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </motion.button>
      </div>

      <div className="flex items-center justify-between mt-2 px-1">
        <AnimatePresence mode="wait">
          {justAdded ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs"
              style={{ color: 'rgba(139,220,180,0.8)' }}
            >
              ✨ 念头已物化
            </motion.span>
          ) : (
            <motion.span
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs"
              style={{ color: 'rgba(200,200,230,0.3)' }}
            >
              按 Enter 释放念头
            </motion.span>
          )}
        </AnimatePresence>

        {todayCount > 0 && (
          <span className="text-xs" style={{ color: 'rgba(200,200,230,0.3)' }}>
            今日 {todayCount} 个念头
          </span>
        )}
      </div>
    </div>
  );
}
