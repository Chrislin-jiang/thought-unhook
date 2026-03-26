/**
 * 🎈 气球释放 — 每个念头绑在气球上，松手让它飞走
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PracticeShell from './PracticeShell';

const BALLOON_COLORS = [
  'rgba(255,107,107,0.3)',
  'rgba(100,180,255,0.3)',
  'rgba(255,200,100,0.3)',
  'rgba(139,220,180,0.3)',
  'rgba(200,150,255,0.3)',
];

export default function BalloonRelease({ onBack }: { onBack: () => void }) {
  return (
    <PracticeShell
      type="balloon-release"
      title="气球释放"
      emoji="🎈"
      introText="每个念头都被绑在一个彩色气球上。"
      introSubText="点击气球松手——看着它越飞越高，越来越小，最终消失在天际。"
      onBack={onBack}
      maxThoughts={5}
    >
      {({ thoughts, phase, setPhase }) => (
        <BalloonAnimation thoughts={thoughts} phase={phase} setPhase={setPhase} onBack={onBack} />
      )}
    </PracticeShell>
  );
}

function BalloonAnimation({
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
  const [releasedBalloons, setReleasedBalloons] = useState<Set<number>>(new Set());

  const handleRelease = useCallback((index: number) => {
    setReleasedBalloons(prev => {
      const next = new Set(prev);
      next.add(index);
      if (next.size === thoughts.length) {
        setTimeout(() => setPhase('done'), 2000);
      }
      return next;
    });
  }, [thoughts.length, setPhase]);

  if (phase === 'done') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-5xl mb-6">🎈</motion.div>
        <p className="text-lg text-center mb-2" style={{ color: 'rgba(200,200,230,0.8)' }}>所有气球都飞走了</p>
        <p className="text-xs text-center mb-6" style={{ color: 'rgba(200,200,230,0.4)' }}>
          它们带走了念头，飘向了天空。你的手空了，心也轻了。
        </p>
        <button onClick={onBack} className="px-6 py-2.5 rounded-full text-sm" style={{
          background: 'rgba(255,255,255,0.05)', color: 'rgba(200,200,230,0.5)',
          border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
        }}>返回实验室</button>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden px-4 py-6">
      <p className="text-center text-xs mb-4 relative z-10" style={{ color: 'rgba(200,200,230,0.4)' }}>
        点击气球松手，让它飞走 — 还剩 {thoughts.length - releasedBalloons.size} 个
      </p>

      <div className="relative flex-1 flex flex-wrap justify-center items-center gap-4 px-4">
        <AnimatePresence>
          {thoughts.map((thought, i) => {
            const isReleased = releasedBalloons.has(i);
            const color = BALLOON_COLORS[i % BALLOON_COLORS.length];
            if (isReleased) return null;
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{
                  opacity: 1,
                  y: [0, -8, 0],
                }}
                exit={{
                  y: -500,
                  opacity: 0,
                  scale: 0.3,
                  transition: { duration: 2, ease: 'easeIn' },
                }}
                transition={{
                  y: { duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' },
                }}
                onClick={() => handleRelease(i)}
                className="relative flex flex-col items-center cursor-pointer"
                style={{ border: 'none', background: 'none' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {/* 气球 */}
                <div className="w-20 h-24 rounded-full relative flex items-center justify-center p-2" style={{
                  background: `radial-gradient(circle at 30% 30%, ${color.replace('0.3', '0.5')}, ${color})`,
                  boxShadow: `0 4px 20px ${color}`,
                }}>
                  <p className="text-[9px] text-center leading-tight" style={{ color: 'rgba(230,230,250,0.9)' }}>
                    {thought.length > 20 ? thought.slice(0, 20) + '...' : thought}
                  </p>
                </div>
                {/* 线 */}
                <div className="w-px h-8" style={{ background: 'rgba(200,200,230,0.2)' }} />
                <span className="text-[10px]" style={{ color: 'rgba(200,200,230,0.3)' }}>松手</span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
