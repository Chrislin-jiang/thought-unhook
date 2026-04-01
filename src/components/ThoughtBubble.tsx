/**
 * 念头气泡 — 柔和卡片风
 */

import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Thought, ReleaseMethod } from '../types';
import { EMOTION_COLORS, PERSONA_INFO, EMOTION_NAMES } from '../types';
import { useThoughtStore } from '../store';

interface Props {
  thought: Thought;
  index: number;
}

function getExitAnimation(method: ReleaseMethod | null) {
  switch (method) {
    case 'blow':
      return {
        opacity: [1, 0.8, 0.4, 0],
        y: [0, -40, -150, -350],
        x: [0, 20, 60, 150],
        scale: [1, 1.02, 0.7, 0.3],
        transition: { duration: 1.8, ease: [0.1, 0.5, 0.3, 1] },
      };
    case 'melt':
      return {
        opacity: [1, 0.7, 0.3, 0],
        y: [0, 15, 60, 150],
        scaleX: [1, 1.05, 1.1, 0.8],
        scaleY: [1, 0.9, 0.5, 0.1],
        filter: ['blur(0px)', 'blur(1px)', 'blur(4px)', 'blur(8px)'],
        transition: { duration: 1.5, ease: [0.4, 0, 0.7, 0.2] },
      };
    case 'resize':
      return {
        opacity: [1, 0.5, 0],
        scale: [1, 0.4, 0.05],
        transition: { duration: 0.8, ease: [0.4, 0, 1, 1] },
      };
    default:
      return {
        opacity: 0,
        scale: 0.5,
        transition: { duration: 0.3 },
      };
  }
}

const ThoughtBubble = forwardRef<HTMLDivElement, Props>(function ThoughtBubble({ thought, index }, ref) {
  const selectThought = useThoughtStore(s => s.selectThought);
  const selectedId = useThoughtStore(s => s.selectedThoughtId);
  const releasingMethod = useThoughtStore(s => s.releasingMethod);
  const isSelected = selectedId === thought.uid;
  const colors = EMOTION_COLORS[thought.emotion];
  const persona = PERSONA_INFO[thought.persona];
  const emotionName = EMOTION_NAMES[thought.emotion];

  const floatDuration = 5 + (index % 3) * 1.5;
  const floatDelay = index * 0.3;
  const floatY = 6 + (index % 4) * 3;
  const displayContent = thought.rewrittenContent || thought.content;
  const offsetX = index % 2 === 0 ? '-4%' : '4%';

  const exitAnim = isSelected ? getExitAnimation(releasingMethod) : getExitAnimation(null);
  const isBlowing = isSelected && releasingMethod === 'blow';
  const isMelting = isSelected && releasingMethod === 'melt';

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={exitAnim}
      whileTap={{ scale: 0.97 }}
      onClick={() => selectThought(isSelected ? null : thought.uid)}
      className="thought-bubble"
      style={{ position: 'relative', transform: `translateX(${offsetX})`, overflow: 'visible' }}
    >
      <div className="bubble-glow" style={{ background: colors.glow }} />

      <motion.div
        animate={isBlowing ? {
          opacity: 0.6,
        } : isMelting ? {
          borderRadius: '28px 28px 40% 40%',
          scaleX: 1.04,
        } : {
          y: [0, -floatY, 0],
        }}
        transition={isBlowing
          ? { duration: 0.5 }
          : isMelting
            ? { duration: 0.7 }
            : { duration: floatDuration, ease: 'easeInOut', repeat: Infinity, delay: floatDelay }
        }
        className="relative rounded-3xl px-5 py-4"
        style={{
          background: isSelected
            ? 'rgba(255,255,255,0.95)'
            : 'rgba(255,255,255,0.8)',
          border: `1.5px solid ${isSelected ? 'rgba(139,124,247,0.3)' : 'rgba(139,124,247,0.08)'}`,
          boxShadow: isSelected
            ? `0 8px 32px rgba(139,124,247,0.15), 0 0 0 4px rgba(139,124,247,0.05)`
            : `0 4px 20px rgba(0,0,0,0.04)`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition: 'all 0.3s ease',
          maxWidth: '300px',
          cursor: 'pointer',
          overflow: 'visible',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* 融化时：emoji */}
        <AnimatePresence>
          {isMelting && (
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 0.9, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.35 }}
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', zIndex: 2,
                pointerEvents: 'none',
              }}
            >
              🫠
            </motion.div>
          )}
        </AnimatePresence>

        {/* 吹走时 */}
        <AnimatePresence>
          {isBlowing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 0.9, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.35 }}
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', zIndex: 2,
                pointerEvents: 'none',
              }}
            >
              ☁️
            </motion.div>
          )}
        </AnimatePresence>

        {/* 标签行 */}
        <motion.div
          className="flex items-center gap-2 mb-2"
          animate={{ opacity: (isBlowing || isMelting) ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: colors.bg,
              color: colors.text,
              fontWeight: 500,
            }}
          >
            {persona.emoji} {emotionName}
          </span>
          <span
            className="text-[10px] ml-auto px-1.5 py-0.5 rounded-full"
            style={{
              background: 'rgba(139,124,247,0.08)',
              color: 'rgba(139,124,247,0.6)',
            }}
          >
            Lv.{thought.intensity}
          </span>
        </motion.div>

        {/* 内容 */}
        <motion.p
          className="text-sm leading-relaxed"
          animate={{ opacity: (isBlowing || isMelting) ? 0 : 1 }}
          transition={{ duration: 0.4 }}
          style={{
            color: thought.rewrittenContent
              ? '#4ECDC4'
              : 'var(--text-primary)',
          }}
        >
          {displayContent}
        </motion.p>

        {/* 标签 */}
        {thought.tags && thought.tags.length > 0 && !isBlowing && !isMelting && (
          <div className="flex gap-1.5 mt-2.5 flex-wrap">
            {thought.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="tag-pill"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 选中指示器 */}
        {isSelected && !isBlowing && !isMelting && (
          <motion.div
            layoutId="selector"
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #8B7CF7, #A78BFA)',
              boxShadow: '0 2px 8px rgba(139,124,247,0.3)',
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
});

export default ThoughtBubble;
