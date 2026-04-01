/**
 * 睡前模式 — 柔和治愈风（保留深色夜间氛围）
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
    const fly: Firefly = { id: String(Date.now()), content: trimmed, x: 15 + Math.random() * 70, y: 15 + Math.random() * 50, active: true };
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
    setBreathPhase('inhale');
    setBreathCount(prev => prev + 1);
    setTimeout(() => {
      setBreathPhase('hold');
      setTimeout(() => {
        setBreathPhase('exhale');
        setTimeout(() => {
          setFireflies(prev => {
            const updated = [...prev];
            if (updated[index]) updated[index] = { ...updated[index], active: false };
            return updated;
          });
          const nextIndex = index + 1;
          setCurrentExtinguishing(nextIndex);
          if (nextIndex < fireflies.length) {
            setTimeout(() => runBreathCycle(nextIndex), 1000);
          } else {
            setTimeout(() => setPhase('done'), 1500);
          }
        }, 6000);
      }, 4000);
    }, 4000);
  };

  return (
    <div className="flex-1 flex flex-col relative z-10"
      style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)', borderRadius: '24px 24px 0 0', margin: '0 4px' }}>
      <AnimatePresence mode="wait">
        {phase === 'input' && (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col px-5 py-6">
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm mb-6" style={{ color: 'rgba(200,200,230,0.6)' }}>
              今天的戏都演完了，把台词都清空吧 🌙
            </motion.p>
            <div className="flex-1 relative min-h-[200px]">
              {fireflies.map((fly, i) => (
                <motion.div key={fly.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0.4, 0.8, 0.4], scale: 1, x: [0, (i % 2 === 0 ? 5 : -5), 0], y: [0, -8, 0] }}
                  transition={{ opacity: { duration: 3, repeat: Infinity }, x: { duration: 4, repeat: Infinity }, y: { duration: 5, repeat: Infinity }, scale: { duration: 0.3 } }}
                  className="absolute" style={{ left: `${fly.x}%`, top: `${fly.y}%` }}>
                  <div className="w-3 h-3 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(255,220,100,0.9) 0%, rgba(255,220,100,0) 70%)', boxShadow: '0 0 12px rgba(255,220,100,0.6)' }} />
                  <p className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] max-w-[120px] truncate"
                    style={{ color: 'rgba(255,220,100,0.4)' }}>{fly.content}</p>
                </motion.div>
              ))}
              {fireflies.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 3, repeat: Infinity }}
                    className="text-5xl">🌙</motion.span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addFirefly(); } }}
                placeholder="写下一句还没散场的台词..." rows={2} maxLength={100}
                className="w-full" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px', color: 'rgba(230,230,250,0.8)', padding: '12px 16px', fontSize: '14px',
                  lineHeight: 1.5, resize: 'none', outline: 'none', fontFamily: 'inherit' }} autoFocus />
              {fireflies.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-4">
                  <p className="text-xs mb-3" style={{ color: 'rgba(200,200,230,0.3)' }}>{fireflies.length} 句台词已化为烛光</p>
                  <motion.button onClick={startBreathing} className="px-6 py-2.5 rounded-full text-sm"
                    style={{ background: 'linear-gradient(135deg, rgba(139,124,247,0.5), rgba(78,205,196,0.5))',
                      color: 'rgba(230,230,250,0.9)', border: '1px solid rgba(139,124,247,0.3)', cursor: 'pointer' }}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    准备好了，开始散场 🌬️
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {phase === 'breathe' && (
          <motion.div key="breathe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-6">
            <motion.div
              animate={{ scale: breathPhase === 'inhale' ? [1, 1.5] : breathPhase === 'hold' ? 1.5 : [1.5, 1] }}
              transition={{ duration: breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 4 : 6, ease: 'easeInOut' }}
              className="w-32 h-32 rounded-full flex items-center justify-center mb-8"
              style={{ background: 'radial-gradient(circle, rgba(139,124,247,0.2) 0%, rgba(139,124,247,0) 70%)',
                border: '1.5px solid rgba(139,124,247,0.2)' }}>
              <span className="text-sm" style={{ color: 'rgba(200,200,230,0.8)' }}>
                {breathPhase === 'inhale' ? '吸气...' : breathPhase === 'hold' ? '停住...' : '呼气...'}
              </span>
            </motion.div>
            <p className="text-xs mb-4" style={{ color: 'rgba(200,200,230,0.4)' }}>第 {breathCount} 次呼吸</p>
            <div className="flex gap-2 flex-wrap justify-center">
              {fireflies.map((fly) => (
                <motion.div key={fly.id}
                  animate={{ opacity: fly.active ? [0.4, 0.8, 0.4] : 0, scale: fly.active ? 1 : 0 }}
                  transition={{ opacity: { duration: 2, repeat: fly.active ? Infinity : 0 }, scale: { duration: 1 } }}
                  className="w-3 h-3 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(255,220,100,0.9) 0%, rgba(255,220,100,0) 70%)',
                    boxShadow: fly.active ? '0 0 10px rgba(255,220,100,0.5)' : 'none' }} />
              ))}
            </div>
            {breathPhase === 'exhale' && currentExtinguishing < fireflies.length && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs mt-4 text-center" style={{ color: 'rgba(255,220,100,0.5)' }}>
                让这句台词谢幕... 🕯️
              </motion.p>
            )}
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center px-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.3 }} className="text-6xl mb-6">🌙</motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
              className="text-lg text-center mb-3" style={{ color: 'rgba(200,200,230,0.8)' }}>
              晚安，今天的戏已经散场
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
              className="text-xs text-center" style={{ color: 'rgba(200,200,230,0.4)' }}>
              {fireflies.length} 场戏已散场 · {breathCount} 次呼吸
            </motion.p>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
              onClick={() => { setPhase('input'); setFireflies([]); setBreathCount(0); setCurrentExtinguishing(-1); }}
              className="mt-8 px-6 py-2.5 rounded-full text-sm"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(200,200,230,0.6)',
                border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
              whileHover={{ scale: 1.05 }}>再来一次</motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
