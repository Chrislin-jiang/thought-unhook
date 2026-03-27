/**
 * 念头输入区组件 — Phase 2.1（含语音输入）
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThoughtStore } from '../store';
import VoiceInput from './VoiceInput';

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

  // 语音识别结果追加到文本
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
          style={{ minHeight: '44px' }}
        />

        {/* 右侧按钮组 */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* <VoiceInput onResult={handleVoiceResult} /> */}
          <motion.button
            onClick={handleSubmit}
            className="w-8 h-8 rounded-full flex items-center justify-center"
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </motion.button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1 px-1">
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
