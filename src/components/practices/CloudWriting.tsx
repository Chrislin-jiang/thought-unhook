/**
 * ☁️ 云上书写 — 念头变成云朵上的文字，风吹过散去
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PracticeShell from './PracticeShell';

export default function CloudWriting({ onBack }: { onBack: () => void }) {
  return (
    <PracticeShell
      type="cloud-writing"
      title="云上书写"
      emoji="☁️"
      introText="你的念头会被写在云朵上。然后，一阵风吹来……"
      introSubText="文字会渐渐散去，就像真正的云一样。"
      onBack={onBack}
      maxThoughts={4}
    >
      {({ thoughts, phase, setPhase }) => (
        <CloudAnimation thoughts={thoughts} phase={phase} setPhase={setPhase} onBack={onBack} />
      )}
    </PracticeShell>
  );
}

function CloudAnimation({
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
  const [dissolvingIndex, setDissolvingIndex] = useState(-1);
  const [allDissolved, setAllDissolved] = useState(false);

  useEffect(() => {
    if (phase !== 'animation') return;

    // 每4秒消散一朵云
    const startDissolving = () => {
      let idx = 0;
      const interval = setInterval(() => {
        setDissolvingIndex(idx);
        idx++;
        if (idx >= thoughts.length) {
          clearInterval(interval);
          setTimeout(() => {
            setAllDissolved(true);
            setTimeout(() => setPhase('done'), 1500);
          }, 3000);
        }
      }, 4000);
      return interval;
    };

    const timer = setTimeout(() => {
      const interval = startDissolving();
      return () => clearInterval(interval);
    }, 1500);

    return () => clearTimeout(timer);
  }, [phase, thoughts.length, setPhase]);

  if (phase === 'done') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-5xl mb-6">🌤️</motion.div>
        <p className="text-lg text-center mb-2" style={{ color: 'rgba(45,43,85,0.8)' }}>天空晴朗了</p>
        <p className="text-xs text-center mb-6" style={{ color: 'rgba(45,43,85,0.35)' }}>
          云朵散去了，带走了文字。天空本来就是空的。
        </p>
        <button onClick={onBack} className="px-6 py-2.5 rounded-full text-sm" style={{
          background: 'rgba(139,124,247,0.04)', color: 'rgba(45,43,85,0.45)',
          border: '1px solid rgba(139,124,247,0.08)', cursor: 'pointer',
        }}>返回实验室</button>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden px-4 py-6">
      {/* 天空背景 */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, rgba(30,30,80,0.3) 0%, rgba(20,20,60,0.1) 100%)',
      }} />

      {/* 云朵 */}
      <div className="relative h-full flex flex-col items-center justify-center gap-6">
        <AnimatePresence>
          {thoughts.map((thought, i) => {
            const isDissolved = i <= dissolvingIndex;
            const isDissolving = i === dissolvingIndex;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isDissolved ? 0 : 1,
                  y: isDissolved ? -50 : 0,
                  scale: isDissolved ? 1.5 : 1,
                  filter: isDissolving ? 'blur(8px)' : 'blur(0px)',
                }}
                transition={{ duration: isDissolving ? 3 : 0.5 }}
                className="relative px-6 py-4 rounded-3xl max-w-xs"
                style={{
                  background: 'rgba(139,124,247,0.08)',
                  border: '1px solid rgba(139,124,247,0.1)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              >
                {/* 云朵装饰 */}
                <div className="absolute -top-2 -left-2 text-xl opacity-30">☁️</div>
                <div className="absolute -bottom-1 -right-2 text-lg opacity-20">☁️</div>
                <p className="text-sm text-center" style={{ color: '#2D2B55' }}>
                  {thought}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {allDissolved && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm"
            style={{ color: 'rgba(45,43,85,0.45)' }}
          >
            风吹过... 一切归于宁静 🍃
          </motion.p>
        )}
      </div>

      {/* 风的动画 */}
      {dissolvingIndex >= 0 && !allDissolved && (
        <motion.div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 text-center text-2xl"
          animate={{ x: [-50, 400], opacity: [0, 0.3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          🍃
        </motion.div>
      )}
    </div>
  );
}
