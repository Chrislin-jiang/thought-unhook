/**
 * 练习通用框架 — 提供统一的引导语→输入→动画→呼吸→完成结构
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThoughtStore } from '../../store';
import type { PracticeType } from '../../types';

interface PracticeShellProps {
  type: PracticeType;
  title: string;
  emoji: string;
  introText: string;
  introSubText: string;
  onBack: () => void;
  children: (props: {
    thoughts: string[];
    phase: 'intro' | 'input' | 'animation' | 'breathe' | 'done';
    setPhase: (p: 'intro' | 'input' | 'animation' | 'breathe' | 'done') => void;
    startTime: number;
  }) => React.ReactNode;
  maxThoughts?: number;
  skipBreathing?: boolean;
}

export default function PracticeShell({
  type,
  title,
  emoji,
  introText,
  introSubText,
  onBack,
  children,
  maxThoughts = 3,
  skipBreathing = false,
}: PracticeShellProps) {
  const [phase, setPhase] = useState<'intro' | 'input' | 'animation' | 'breathe' | 'done'>('intro');
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [thoughtUids, setThoughtUids] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [startTime] = useState(Date.now());
  const addThought = useThoughtStore(s => s.addThought);
  const releaseThought = useThoughtStore(s => s.releaseThought);
  const addPracticeRecord = useThoughtStore(s => s.addPracticeRecord);

  const handleAddThought = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    
    const t = await addThought(trimmed);
    setThoughtUids(prev => [...prev, t.uid]);
    setThoughts(prev => [...prev, trimmed]);
    setInput('');
    inputRef.current?.focus();
  };

  const handleStartAnimation = () => {
    if (thoughts.length === 0) return;
    setPhase('animation');
  };

  const handleComplete = () => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    // 练习完成后，将所有练习中的念头标记为已释放
    for (const uid of thoughtUids) {
      releaseThought(uid, 'observe');
    }
    addPracticeRecord({
      id: String(Date.now()),
      type,
      completedAt: Date.now(),
      duration,
      thoughtsUsed: thoughts,
    });
    setPhase('done');
  };

  return (
    <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
      {/* 返回按钮 */}
      <div className="px-4 pt-3">
        <button
          onClick={onBack}
          className="text-xs px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(200,200,230,0.5)',
            border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
          }}
        >
          ← 返回练习
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* 引导语阶段 */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-8"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-5xl mb-6"
            >
              {emoji}
            </motion.div>
            <h2 className="text-lg font-medium mb-3" style={{ color: 'rgba(230,230,250,0.9)' }}>
              {title}
            </h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-center mb-2 leading-relaxed"
              style={{ color: 'rgba(200,200,230,0.6)' }}
            >
              {introText}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xs text-center mb-8"
              style={{ color: 'rgba(200,200,230,0.3)' }}
            >
              {introSubText}
            </motion.p>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              onClick={() => setPhase('input')}
              className="px-8 py-3 rounded-full text-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(139,120,255,0.8), rgba(100,180,255,0.8))',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              准备好了
            </motion.button>
          </motion.div>
        )}

        {/* 输入阶段 */}
        {phase === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col px-5 py-4"
          >
            <p className="text-center text-sm mb-4" style={{ color: 'rgba(200,200,230,0.5)' }}>
              写下{maxThoughts > 1 ? `1-${maxThoughts}个` : '一个'}最近困扰你的念头
            </p>

            {/* 已输入的念头列表 */}
            {thoughts.length > 0 && (
              <div className="space-y-2 mb-4">
                {thoughts.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 rounded-xl text-xs"
                    style={{
                      background: 'rgba(139,120,255,0.08)',
                      border: '1px solid rgba(139,120,255,0.15)',
                      color: 'rgba(200,200,230,0.7)',
                    }}
                  >
                    {t}
                  </motion.div>
                ))}
              </div>
            )}

            {/* 输入框 */}
            {thoughts.length < maxThoughts && (
              <div className="relative mb-4">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddThought();
                    }
                  }}
                  placeholder="写下一个念头..."
                  rows={2}
                  maxLength={100}
                  className="w-full"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '14px',
                    color: 'rgba(230,230,250,0.8)',
                    padding: '12px 16px',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    resize: 'none',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                  autoFocus
                />
              </div>
            )}

            {/* 开始按钮 */}
            {thoughts.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <p className="text-xs mb-3" style={{ color: 'rgba(200,200,230,0.3)' }}>
                  {thoughts.length} 个念头已准备好
                </p>
                <motion.button
                  onClick={handleStartAnimation}
                  className="px-6 py-2.5 rounded-full text-sm"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,120,255,0.8), rgba(100,180,255,0.8))',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  开始练习 ✨
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* 动画/呼吸/完成 — 由子组件接管 */}
        {(phase === 'animation' || phase === 'breathe' || phase === 'done') && (
          <motion.div
            key="practice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {children({
              thoughts,
              phase,
              setPhase: (p) => {
                if (p === 'done') {
                  handleComplete();
                } else {
                  setPhase(p);
                }
              },
              startTime,
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
