/**
 * 🌊 念头漂流瓶 — 念头装进瓶子放入海浪
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PracticeShell from './PracticeShell';

export default function DriftBottle({ onBack }: { onBack: () => void }) {
  return (
    <PracticeShell
      type="drift-bottle"
      title="念头漂流瓶"
      emoji="🌊"
      introText="海浪轻轻拍打着岸边。你手里有几个玻璃瓶。"
      introSubText="把念头写在纸条上，装进瓶子，放入海浪——看着它慢慢漂远。"
      onBack={onBack}
      maxThoughts={4}
    >
      {({ thoughts, phase, setPhase }) => (
        <BottleAnimation thoughts={thoughts} phase={phase} setPhase={setPhase} onBack={onBack} />
      )}
    </PracticeShell>
  );
}

function BottleAnimation({
  thoughts,
  phase,
  setPhase,
  onBack,
}: {
  thoughts: string[];
  phase: string;
  setPhase: (p: 'animation' | 'breathe' | 'done') => void;
  onBack: () => void;
}) {
  const [driftedBottles, setDriftedBottles] = useState<Set<number>>(new Set());

  const handleDrift = useCallback((index: number) => {
    setDriftedBottles(prev => {
      const next = new Set(prev);
      next.add(index);
      if (next.size === thoughts.length) {
        setTimeout(() => setPhase('done'), 2500);
      }
      return next;
    });
  }, [thoughts.length, setPhase]);

  if (phase === 'done') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-5xl mb-6">🌅</motion.div>
        <p className="text-lg text-center mb-2" style={{ color: 'rgba(45,43,85,0.8)' }}>瓶子都漂远了</p>
        <p className="text-xs text-center mb-6" style={{ color: 'rgba(45,43,85,0.35)' }}>
          也许在某个遥远的海岸，有人会捡到它。但此刻，你可以放手了。
        </p>
        <button onClick={onBack} className="px-6 py-2.5 rounded-full text-sm" style={{
          background: 'rgba(139,124,247,0.04)', color: 'rgba(45,43,85,0.45)',
          border: '1px solid rgba(139,124,247,0.08)', cursor: 'pointer',
        }}>返回实验室</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      <p className="text-center text-xs py-3 relative z-10" style={{ color: 'rgba(45,43,85,0.35)' }}>
        点击瓶子将它放入海浪 🌊
      </p>

      {/* 海洋区域 */}
      <div className="flex-1 relative">
        {/* 海浪动画 */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1/3"
          style={{
            background: 'linear-gradient(0deg, rgba(30,60,120,0.4) 0%, rgba(30,60,120,0) 100%)',
          }}
        >
          <motion.div
            animate={{ x: [-20, 20, -20] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 left-0 right-0 text-2xl text-center opacity-20"
          >
            〰️〰️〰️〰️〰️
          </motion.div>
        </motion.div>

        {/* 瓶子列表 */}
        <div className="flex flex-wrap justify-center items-start gap-4 p-4 relative z-10">
          <AnimatePresence>
            {thoughts.map((thought, i) => {
              const isDrifted = driftedBottles.has(i);
              if (isDrifted) {
                return (
                  <motion.div
                    key={`drifted-${i}`}
                    initial={{ y: 0, x: 0, opacity: 1 }}
                    animate={{
                      y: [0, 10, -5, 15],
                      x: [0, 30, 80, 200],
                      opacity: [1, 0.8, 0.4, 0],
                      scale: [1, 0.9, 0.7, 0.4],
                    }}
                    transition={{ duration: 3, ease: 'easeOut' }}
                    className="text-2xl"
                  >
                    🍾
                  </motion.div>
                );
              }
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  onClick={() => handleDrift(i)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer"
                  style={{
                    background: 'rgba(139,124,247,0.03)',
                    border: '1px solid rgba(100,150,200,0.15)',
                    maxWidth: '160px',
                  }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-3xl"
                  >
                    🍾
                  </motion.span>
                  <p className="text-[10px] text-center leading-tight" style={{ color: 'rgba(45,43,85,0.5)' }}>
                    {thought.length > 30 ? thought.slice(0, 30) + '...' : thought}
                  </p>
                  <span className="text-[9px]" style={{ color: 'rgba(100,180,255,0.4)' }}>
                    点击放入海中
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
