/**
 * 漂浮气泡组件 — 精致轻盈
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

  // 交错偏移：奇偶序号左右错开
  const offsetX = index % 2 === 0 ? '-8%' : '8%';

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.6, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{
        opacity: 0, scale: 0.3, y: -80,
        transition: { duration: 0.5, ease: 'easeIn' }
      }}
      whileTap={{ scale: 0.97 }}
      onClick={() => selectThought(isSelected ? null : thought.uid)}
      className="thought-bubble"
      style={{ position: 'relative', transform: `translateX(${offsetX})` }}
    >
      <div className="bubble-glow" style={{ background: colors.glow }} />

      <motion.div
        animate={{ y: [0, -floatY, 0], x: [0, floatX, 0] }}
        transition={{
          duration: floatDuration, ease: 'easeInOut',
          repeat: Infinity, delay: floatDelay,
        }}
        className="relative rounded-3xl px-5 py-3.5 backdrop-blur-sm"
        style={{
          background: isSelected
            ? `linear-gradient(135deg, ${colors.bg.replace('0.12', '0.18')}, rgba(139,124,247,0.06))`
            : colors.bg,
          border: `1px solid ${isSelected ? 'rgba(139,124,247,0.25)' : 'rgba(200,200,230,0.04)'}`,
          boxShadow: isSelected
            ? `0 0 20px ${colors.glow}, 0 4px 30px rgba(0,0,0,0.2)`
            : `0 2px 16px rgba(0,0,0,0.15)`,
          transition: 'border-color 0.4s, box-shadow 0.4s, background 0.4s',
          maxWidth: '280px',
          cursor: 'pointer',
        }}
      >
        {/* 精简标签行：只有角色emoji + 情绪 */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs" title={persona.name}>{persona.emoji}</span>
          <span
            className="text-[10px]"
            style={{ color: colors.text, opacity: 0.85 }}
          >
            {emotionName}
          </span>
        </div>

        {/* 念头内容 */}
        <p
          className="text-[13px] leading-relaxed"
          style={{
            color: thought.rewrittenContent
              ? 'rgba(124,197,168,0.9)'
              : 'rgba(220,220,240,0.88)',
          }}
        >
          {displayContent}
        </p>

        {/* 标签（仅在有自定义标签时显示） */}
        {thought.tags && thought.tags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {thought.tags.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="text-[9px] px-1.5 py-0.5 rounded-full"
                style={{
                  background: 'rgba(139,124,247,0.06)',
                  color: 'rgba(139,124,247,0.4)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 选中指示 */}
        {isSelected && (
          <motion.div
            layoutId="selector"
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full"
            style={{
              background: 'linear-gradient(90deg, rgba(139,124,247,0.6), rgba(108,180,238,0.4))',
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
});

export default ThoughtBubble;
