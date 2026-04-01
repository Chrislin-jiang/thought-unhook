/**
 * 🔬 念头显微镜 — 放大观察念头的微观结构并消散
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PracticeShell from './PracticeShell';

export default function Microscope({ onBack }: { onBack: () => void }) {
  return (
    <PracticeShell
      type="microscope"
      title="念头显微镜"
      emoji="🔬"
      introText="如果把一个念头放到显微镜下，你会看到什么？"
      introSubText="文字 → 音节 → 笔画 → 像素 → 消散。放大到最后，什么都不是。"
      onBack={onBack}
      maxThoughts={1}
    >
      {({ thoughts, phase, setPhase }) => (
        <MicroscopeAnimation thought={thoughts[0]} phase={phase} setPhase={setPhase} onBack={onBack} />
      )}
    </PracticeShell>
  );
}

type ZoomLevel = 'sentence' | 'words' | 'chars' | 'pixels' | 'dissolved';

function MicroscopeAnimation({
  thought,
  phase,
  setPhase,
  onBack,
}: {
  thought: string;
  phase: string;
  setPhase: (p: 'animation' | 'breathe' | 'done') => void;
  onBack: () => void;
}) {
  const [zoom, setZoom] = useState<ZoomLevel>('sentence');
  const [autoProgress, setAutoProgress] = useState(true);

  const levels: ZoomLevel[] = ['sentence', 'words', 'chars', 'pixels', 'dissolved'];
  const currentLevelIndex = levels.indexOf(zoom);

  useEffect(() => {
    if (phase !== 'animation' || !autoProgress) return;

    const timer = setInterval(() => {
      setZoom(prev => {
        const idx = levels.indexOf(prev);
        if (idx < levels.length - 1) {
          return levels[idx + 1];
        }
        clearInterval(timer);
        setTimeout(() => setPhase('done'), 1500);
        return prev;
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [phase, autoProgress, setPhase]);

  const zoomLabels: Record<ZoomLevel, { label: string; magnification: string }> = {
    sentence: { label: '完整句子', magnification: '1x' },
    words: { label: '词语碎片', magnification: '10x' },
    chars: { label: '单个字符', magnification: '100x' },
    pixels: { label: '像素点', magnification: '1000x' },
    dissolved: { label: '虚空', magnification: '∞' },
  };

  if (phase === 'done') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-5xl mb-6">✨</motion.div>
        <p className="text-lg text-center mb-2" style={{ color: 'rgba(45,43,85,0.8)' }}>什么都没有了</p>
        <p className="text-xs text-center mb-6" style={{ color: 'rgba(45,43,85,0.35)' }}>
          放大到最后，念头只是一堆像素。再放大，连像素都消失了。它从来就不是一个"事实"。
        </p>
        <button onClick={onBack} className="px-6 py-2.5 rounded-full text-sm" style={{
          background: 'rgba(139,124,247,0.04)', color: 'rgba(45,43,85,0.45)',
          border: '1px solid rgba(139,124,247,0.08)', cursor: 'pointer',
        }}>返回实验室</button>
      </div>
    );
  }

  const renderContent = () => {
    switch (zoom) {
      case 'sentence':
        return (
          <motion.p
            key="sentence"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-base text-center leading-relaxed"
            style={{ color: '#2D2B55' }}
          >
            {thought}
          </motion.p>
        );
      case 'words':
        const words = thought.match(/[\u4e00-\u9fa5]{1,2}|[a-zA-Z]+|\S/g) || [thought];
        return (
          <motion.div
            key="words"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-3 justify-center"
          >
            {words.map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-lg px-2 py-1 rounded-lg"
                style={{
                  background: 'rgba(139,124,247,0.1)',
                  color: 'rgba(45,43,85,0.65)',
                }}
              >
                {w}
              </motion.span>
            ))}
          </motion.div>
        );
      case 'chars':
        const chars = thought.split('');
        return (
          <motion.div
            key="chars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {chars.map((c, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, rotate: -10 }}
                animate={{ opacity: [0.3, 0.8, 0.3], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.05 }}
                className="text-2xl font-mono"
                style={{ color: 'rgba(45,43,85,0.45)' }}
              >
                {c === ' ' ? '·' : c}
              </motion.span>
            ))}
          </motion.div>
        );
      case 'pixels':
        return (
          <motion.div
            key="pixels"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap gap-1 justify-center max-w-xs"
          >
            {Array.from({ length: Math.min(thought.length * 3, 60) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1 }}
                animate={{ opacity: [0.1, 0.6, 0.1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: Math.random() * 1.5 }}
                className="w-2 h-2 rounded-sm"
                style={{
                  background: `rgba(${100 + Math.random() * 100}, ${100 + Math.random() * 100}, ${200 + Math.random() * 55}, 0.4)`,
                }}
              />
            ))}
          </motion.div>
        );
      case 'dissolved':
        return (
          <motion.div
            key="dissolved"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.p
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-4xl mb-4"
            >
              ·
            </motion.p>
            <p className="text-xs" style={{ color: 'rgba(45,43,85,0.25)' }}>
              什么都没有了
            </p>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      {/* 放大镜框 */}
      <div className="w-64 h-64 rounded-full flex items-center justify-center mb-6 p-8" style={{
        background: 'rgba(255,255,255,0.02)',
        border: '2px solid rgba(139,120,255,0.2)',
        boxShadow: '0 0 30px rgba(139,120,255,0.05)',
      }}>
        {renderContent()}
      </div>

      {/* 放大倍数 */}
      <div className="text-center mb-4">
        <span className="text-lg font-mono" style={{ color: 'rgba(139,124,247,0.6)' }}>
          🔬 {zoomLabels[zoom].magnification}
        </span>
        <p className="text-xs mt-1" style={{ color: 'rgba(45,43,85,0.35)' }}>
          {zoomLabels[zoom].label}
        </p>
      </div>

      {/* 进度条 */}
      <div className="flex gap-2">
        {levels.map((level, i) => (
          <button
            key={level}
            onClick={() => { setAutoProgress(false); setZoom(level); }}
            className="w-8 h-1.5 rounded-full transition-all"
            style={{
              background: i <= currentLevelIndex ? 'rgba(139,120,255,0.6)' : 'rgba(139,124,247,0.1)',
              cursor: 'pointer',
              border: 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
