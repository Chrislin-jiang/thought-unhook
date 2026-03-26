/**
 * 🚂 念头列车 — 念头变成列车车厢，看它们驶过站台
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PracticeShell from './PracticeShell';

export default function ThoughtTrain({ onBack }: { onBack: () => void }) {
  return (
    <PracticeShell
      type="thought-train"
      title="念头列车"
      emoji="🚂"
      introText="想象你站在一个安静的站台上。远处传来汽笛声，一列列车正缓缓驶来。"
      introSubText="你的念头会变成列车的车厢——你只需要站在站台上，看着它们经过。"
      onBack={onBack}
      maxThoughts={5}
    >
      {({ thoughts, phase, setPhase }) => (
        <TrainAnimation thoughts={thoughts} phase={phase} setPhase={setPhase} />
      )}
    </PracticeShell>
  );
}

function TrainAnimation({
  thoughts,
  phase,
  setPhase,
}: {
  thoughts: string[];
  phase: string;
  setPhase: (p: 'animation' | 'breathe' | 'done') => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allPassed, setAllPassed] = useState(false);

  useEffect(() => {
    if (phase !== 'animation') return;
    if (currentIndex >= thoughts.length) {
      setAllPassed(true);
      setTimeout(() => setPhase('done'), 2000);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentIndex, thoughts.length, phase, setPhase]);

  if (phase === 'done') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-5xl mb-6">🌿</motion.div>
        <p className="text-lg text-center mb-2" style={{ color: 'rgba(200,200,230,0.8)' }}>列车已经远去了</p>
        <p className="text-xs text-center mb-6" style={{ color: 'rgba(200,200,230,0.4)' }}>
          {thoughts.length} 节车厢载着你的念头驶向了远方。你还在这里。
        </p>
        <button onClick={onBack} className="px-6 py-2.5 rounded-full text-sm" style={{
          background: 'rgba(255,255,255,0.05)', color: 'rgba(200,200,230,0.5)',
          border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
        }}>返回实验室</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* 站台地面 */}
      <div className="absolute bottom-32 left-0 right-0 h-px" style={{ background: 'rgba(200,200,230,0.1)' }} />
      
      {/* 站台标识 */}
      <motion.p
        className="absolute bottom-36 text-xs"
        style={{ color: 'rgba(200,200,230,0.3)' }}
      >
        🚏 你站在这里，安静地观察
      </motion.p>

      {/* 列车车厢动画 */}
      <div className="relative w-full h-40 mb-20 overflow-hidden">
        <AnimatePresence>
          {currentIndex < thoughts.length && !allPassed && (
            <motion.div
              key={currentIndex}
              initial={{ x: '120%' }}
              animate={{ x: '0%' }}
              exit={{ x: '-120%' }}
              transition={{ duration: 3.5, ease: 'linear' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="p-5 rounded-2xl max-w-xs w-full" style={{
                background: 'rgba(139,120,255,0.08)',
                border: '1px solid rgba(139,120,255,0.2)',
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🚃</span>
                  <span className="text-[10px]" style={{ color: 'rgba(200,200,230,0.4)' }}>
                    车厢 #{currentIndex + 1}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'rgba(230,230,250,0.8)' }}>
                  {thoughts[currentIndex]}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {allPassed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center text-sm"
            style={{ color: 'rgba(200,200,230,0.5)' }}
          >
            列车渐行渐远... 🌫️
          </motion.p>
        )}
      </div>

      {/* 进度 */}
      <div className="flex gap-2">
        {thoughts.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-500"
            style={{
              background: i < currentIndex ? 'rgba(139,220,180,0.5)' : i === currentIndex ? 'rgba(139,120,255,0.8)' : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>

      <p className="text-xs mt-4" style={{ color: 'rgba(200,200,230,0.3)' }}>
        只是看着，不需要做什么
      </p>
    </div>
  );

  function onBack() {
    // handled by parent
  }
}
