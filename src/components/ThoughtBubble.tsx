/**
 * 漂浮气泡 — 赛博科技 + 圆润气泡
 */

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { Thought } from '../types';
import { EMOTION_COLORS, PERSONA_INFO, EMOTION_NAMES } from '../types';
import { useThoughtStore } from '../store';

interface Props {
  thought: Thought;
  index: number;
}

const ThoughtBubble = forwardRef<HTMLDivElement, Props>(function ThoughtBubble({ thought, index }, ref) {
  const selectThought = useThoughtStore(s => s.selectThought);
  const selectedId = useThoughtStore(s => s.selectedThoughtId);
  const isSelected = selectedId === thought.uid;
  const colors = EMOTION_COLORS[thought.emotion];
  const persona = PERSONA_INFO[thought.persona];
  const emotionName = EMOTION_NAMES[thought.emotion];

  const floatDuration = 5 + (index % 3) * 1.5;
  const floatDelay = index * 0.3;
  const floatY = 8 + (index % 4) * 4;
  const floatX = ((index % 2 === 0) ? 1 : -1) * (2 + (index % 3) * 2);
  const displayContent = thought.rewrittenContent || thought.content;
  const offsetX = index % 2 === 0 ? '-8%' : '8%';

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{
        opacity: 0, scale: 0.3, filter: 'brightness(2) blur(6px)',
        transition: { duration: 0.4 }
      }}
      whileTap={{ scale: 0.97 }}
      onClick={() => selectThought(isSelected ? null : thought.uid)}
      className="thought-bubble"
      style={{ position: 'relative', transform: `translateX(${offsetX})` }}
    >
      <div className="bubble-glow" style={{ background: colors.glow }} />

      <motion.div
        animate={{ y: [0, -floatY, 0], x: [0, floatX, 0] }}
        transition={{ duration: floatDuration, ease: 'easeInOut', repeat: Infinity, delay: floatDelay }}
        className="relative rounded-3xl px-5 py-3.5 backdrop-blur-sm"
        style={{
          background: isSelected
            ? `linear-gradient(135deg, ${colors.bg.replace('0.12', '0.18')}, rgba(0,240,255,0.03))`
            : colors.bg,
          border: `1px solid ${isSelected ? 'rgba(0,240,255,0.25)' : 'rgba(0,240,255,0.04)'}`,
          boxShadow: isSelected
            ? `0 0 20px ${colors.glow}, 0 0 40px rgba(0,240,255,0.04)`
            : `0 2px 16px rgba(0,0,0,0.15)`,
          transition: 'all 0.3s ease',
          maxWidth: '280px',
          cursor: 'pointer',
        }}
      >
        {/* 标签行 */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs">{persona.emoji}</span>
          <span
            className="text-[10px]"
            style={{ color: colors.text, opacity: 0.85 }}
          >
            {emotionName}
          </span>
          <span
            className="text-[9px] font-mono ml-auto"
            style={{ color: 'rgba(0,240,255,0.2)' }}
          >
            LV.{thought.intensity}
          </span>
        </div>

        {/* 内容 */}
        <p
          className="text-[13px] leading-relaxed"
          style={{
            color: thought.rewrittenContent
              ? 'rgba(0,255,136,0.85)'
              : 'rgba(220,230,245,0.88)',
          }}
        >
          {displayContent}
        </p>

        {/* 标签 */}
        {thought.tags && thought.tags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {thought.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="text-[9px] px-1.5 py-0.5 font-mono rounded-full"
                style={{
                  background: 'rgba(0,240,255,0.04)',
                  color: 'rgba(0,240,255,0.35)',
                  border: '1px solid rgba(0,240,255,0.08)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 选中扫描线 */}
        {isSelected && (
          <motion.div
            className="absolute left-0 right-0 h-[1px] rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.5), transparent)',
            }}
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* 选中底部指示 */}
        {isSelected && (
          <motion.div
            layoutId="selector"
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full"
            style={{
              background: '#00f0ff',
              boxShadow: '0 0 6px rgba(0,240,255,0.5)',
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
});

export default ThoughtBubble;
