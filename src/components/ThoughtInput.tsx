/**
 * 念头输入区 — 赛博终端风
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
        {/* 左侧竖线装饰 */}
        <div
          className="absolute left-0 top-2 bottom-2 w-[2px]"
          style={{
            background: text.trim()
              ? 'linear-gradient(180deg, #00f0ff, rgba(0,240,255,0.1))'
              : 'linear-gradient(180deg, rgba(0,240,255,0.15), rgba(0,240,255,0.03))',
            transition: 'background 0.3s',
          }}
        />
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={2}
          maxLength={200}
          className="w-full pr-20 pl-4"
          style={{ minHeight: '44px' }}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <motion.button
            onClick={handleSubmit}
            className="w-8 h-8 flex items-center justify-center"
            style={{
              background: text.trim()
                ? 'rgba(0,240,255,0.15)'
                : 'rgba(0,240,255,0.03)',
              border: `1px solid ${text.trim() ? 'rgba(0,240,255,0.4)' : 'rgba(0,240,255,0.06)'}`,
              borderRadius: '2px',
              cursor: text.trim() ? 'pointer' : 'default',
              color: text.trim() ? '#00f0ff' : 'rgba(0,240,255,0.15)',
              boxShadow: text.trim() ? '0 0 12px rgba(0,240,255,0.15)' : 'none',
              transition: 'all 0.2s',
            }}
            whileHover={text.trim() ? { scale: 1.1, boxShadow: '0 0 20px rgba(0,240,255,0.25)' } : {}}
            whileTap={text.trim() ? { scale: 0.9 } : {}}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs font-mono"
              style={{ color: 'rgba(0,255,136,0.7)' }}
            >
              {'>'} 台词已记录
            </motion.span>
          ) : (
            <motion.span
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs font-mono"
              style={{ color: 'rgba(0,240,255,0.2)' }}
            >
              ENTER 记录台词
            </motion.span>
          )}
        </AnimatePresence>

        {todayCount > 0 && (
          <span className="text-xs font-mono" style={{ color: 'rgba(0,240,255,0.2)' }}>
            [{todayCount}] 场戏
          </span>
        )}
      </div>
    </div>
  );
}
