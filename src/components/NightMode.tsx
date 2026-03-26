/**
 * 睡前模式 — Phase 1 简化版
 * 
 * 流程：
 * 1. 深色极简界面
 * 2. 快速连续输入念头
 * 3. 念头变成萤火虫光点
 * 4. 配合呼吸引导，逐个熄灭
 * 5. "晚安，你已经放下了今天"
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThoughtStore } from '../store';

type NightPhase = 'input' | 'breathe' | 'done';

interface Firefly {
  id: string;
  content: string;
  x: number;
  y: number;
  active: boolean;
}

export default function NightMode() {
  const [phase, setPhase] = useState<NightPhase>('input');
  const [input, setInput] = useState('');
  const [fireflies, setFireflies] = useState<Firefly[]>([]);
  const [breathCount, setBreathCount] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [currentExtinguishing, setCurrentExtinguishing] = useState(-1);
  const addThought = useThoughtStore(s => s.addThought);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const addFirefly = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    await addThought(trimmed);

    const fly: Firefly = {
      id: String(Date.now()),
      content: trimmed,
      x: 15 + Math.random() * 70,
      y: 15 + Math.random() * 50,
      active: true,
    };

    setFireflies(prev => [...prev, fly]);
    setInput('');
    inputRef.current?.focus();
  }, [input, addThought]);

  const startBreathing = useCallback(() => {
    if (fireflies.length === 0) return;
    setPhase('breathe');
    setCurrentExtinguishing(0);
    runBreathCycle(0);
  }, [fireflies.length]);

  const runBreathCycle = (index: number) => {
    // 吸气 4s
    setBreathPhase('inhale');
    setBreathCount(prev => prev + 1);

    setTimeout(() => {
      // 停 4s
      setBreathPhase('hold');

      setTimeout(() => {
        // 呼气 6s — 这时熄灭一个光点
        setBreathPhase('exhale');

        setTimeout(() => {
          // 熄灭当前光点
          setFireflies(prev => {
            const updated = [...prev];
            if (updated[index]) {
              updated[index] = { ...updated[index], active: false };
            }
            return updated;
          });

          const nextIndex = index + 1;
          setCurrentExtinguishing(nextIndex);

          if (nextIndex < fireflies.length) {
            // 继续下一个循环
            setTimeout(() => runBreathCycle(nextIndex), 1000);
          } else {
            // 全部熄灭
            setTimeout(() => setPhase('done'), 1500);
          }
        }, 6000);
      }, 4000);
    }, 4000);
  };

  return (
    <div className="flex-1 flex flex-col relative z-10">
      <AnimatePresence mode="wait">
        {/* 输入阶段 */}
        {phase === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col px-5 py-6"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm mb-6"
              style={{ color: 'rgba(200,200,230,0.5)' }}
            >
              把今天还在脑子里转的东西都倒出来 🌙
            </motion.p>

            {/* 萤火虫区域 */}
            <div className="flex-1 relative min-h-[200px]">
              {fireflies.map((fly, i) => (
                <motion.div
                  key={fly.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                    scale: 1,
                    x: [0, (i % 2 === 0 ? 5 : -5), 0],
                    y: [0, -8, 0],
                  }}
                  transition={{
                    opacity: { duration: 3, repeat: Infinity },
                    x: { duration: 4, repeat: Infinity },
                    y: { duration: 5, repeat: Infinity },
                    scale: { duration: 0.3 },
                  }}
                  className="absolute"
                  style={{
                    left: `${fly.x}%`,
                    top: `${fly.y}%`,
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,220,100,0.9) 0%, rgba(255,220,100,0) 70%)',
                      boxShadow: '0 0 12px rgba(255,220,100,0.6)',
                    }}
                  />
                  <p
                    className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] max-w-[120px] truncate"
                    style={{ color: 'rgba(255,220,100,0.4)' }}
                  >
                    {fly.content}
                  </p>
                </motion.div>
              ))}

              {fireflies.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-4xl"
                  >
                    🌙
                  </motion.span>
                </div>
              )}
            </div>

            {/* 输入区 */}
            <div className="mt-4">
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      addFirefly();
                    }
                  }}
                  placeholder="写下一个念头，按回车..."
                  rows={2}
                  maxLength={100}
                  className="w-full"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px',
                    color: 'rgba(230,230,250,0.7)',
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

              {fireflies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center mt-4"
                >
                  <p className="text-xs mb-3" style={{ color: 'rgba(200,200,230,0.3)' }}>
                    {fireflies.length} 个念头已化为光点
                  </p>
                  <motion.button
                    onClick={startBreathing}
                    className="px-6 py-2.5 rounded-full text-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(100,120,180,0.4), rgba(80,100,160,0.3))',
                      color: 'rgba(200,200,230,0.8)',
                      border: '1px solid rgba(100,120,180,0.3)',
                      cursor: 'pointer',
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    准备好了，开始呼吸 🌬️
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* 呼吸阶段 */}
        {phase === 'breathe' && (
          <motion.div
            key="breathe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6"
          >
            {/* 呼吸引导圆 */}
            <motion.div
              animate={{
                scale: breathPhase === 'inhale' ? [1, 1.5] :
                       breathPhase === 'hold' ? 1.5 :
                       [1.5, 1],
              }}
              transition={{
                duration: breathPhase === 'inhale' ? 4 :
                          breathPhase === 'hold' ? 4 :
                          6,
                ease: 'easeInOut',
              }}
              className="w-32 h-32 rounded-full flex items-center justify-center mb-8"
              style={{
                background: 'radial-gradient(circle, rgba(100,120,180,0.3) 0%, rgba(100,120,180,0) 70%)',
                border: '1px solid rgba(100,120,180,0.2)',
              }}
            >
              <span className="text-sm" style={{ color: 'rgba(200,200,230,0.7)' }}>
                {breathPhase === 'inhale' ? '吸气...' :
                 breathPhase === 'hold' ? '停住...' :
                 '呼气...'}
              </span>
            </motion.div>

            {/* 呼吸计时 */}
            <p className="text-xs mb-4" style={{ color: 'rgba(200,200,230,0.3)' }}>
              第 {breathCount} 次呼吸
            </p>

            {/* 萤火虫状态 */}
            <div className="flex gap-2 flex-wrap justify-center">
              {fireflies.map((fly, i) => (
                <motion.div
                  key={fly.id}
                  animate={{
                    opacity: fly.active ? [0.4, 0.8, 0.4] : 0,
                    scale: fly.active ? 1 : 0,
                  }}
                  transition={{
                    opacity: { duration: 2, repeat: fly.active ? Infinity : 0 },
                    scale: { duration: 1 },
                  }}
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,220,100,0.9) 0%, rgba(255,220,100,0) 70%)',
                    boxShadow: fly.active ? '0 0 10px rgba(255,220,100,0.5)' : 'none',
                  }}
                />
              ))}
            </div>

            {/* 当前熄灭提示 */}
            {breathPhase === 'exhale' && currentExtinguishing < fireflies.length && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs mt-4 text-center"
                style={{ color: 'rgba(255,220,100,0.5)' }}
              >
                让这个念头熄灭... 🕯️
              </motion.p>
            )}
          </motion.div>
        )}

        {/* 完成阶段 */}
        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center px-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }}
              className="text-5xl mb-6"
            >
              🌙
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-lg text-center mb-3"
              style={{ color: 'rgba(200,200,230,0.7)' }}
            >
              晚安，你已经放下了今天
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-xs text-center"
              style={{ color: 'rgba(200,200,230,0.3)' }}
            >
              {fireflies.length} 个念头已安息 · {breathCount} 次呼吸
            </motion.p>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              onClick={() => {
                setPhase('input');
                setFireflies([]);
                setBreathCount(0);
                setCurrentExtinguishing(-1);
              }}
              className="mt-8 px-6 py-2.5 rounded-full text-sm"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(200,200,230,0.5)',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
              }}
              whileHover={{ scale: 1.05 }}
            >
              再来一次
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
