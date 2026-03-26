/**
 * 漂浮气泡组件 — 念头的物化形态
 */

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { Thought } from '../types';
import { EMOTION_COLORS, PERSONA_INFO, DISTORTION_NAMES, EMOTION_NAMES } from '../types';
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
  const distortionName = DISTORTION_NAMES[thought.cognitiveDistortion];
  const emotionName = EMOTION_NAMES[thought.emotion];

  // 根据 index 生成不同的漂浮动画参数
  const floatDuration = 5 + (index % 3) * 1.5;
  const floatDelay = index * 0.2;
  const floatY = 12 + (index % 4) * 5;
  const floatX = ((index % 2 === 0) ? 1 : -1) * (3 + (index % 3) * 2);

  // 根据粘性调整透明度
  const stickinessOpacity = 0.6 + (thought.stickiness / 10) * 0.4;

  const displayContent = thought.rewrittenContent || thought.content;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.3, y: 30 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0,
        y: -100,
        transition: { duration: 0.6, ease: 'easeIn' }
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => selectThought(isSelected ? null : thought.uid)}
      className="thought-bubble"
      style={{ position: 'relative' }}
    >
      {/* 背景光晕 */}
      <div className="bubble-glow" style={{ background: colors.glow }} />

      {/* 主气泡 */}
      <motion.div
        animate={{
          y: [0, -floatY, 0],
          x: [0, floatX, 0],
        }}
        transition={{
          duration: floatDuration,
          ease: 'easeInOut',
          repeat: Infinity,
          delay: floatDelay,
        }}
        className="relative rounded-2xl p-4 backdrop-blur-md"
        style={{
          background: colors.bg,
          border: `1px solid ${isSelected ? 'rgba(139,120,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: isSelected
            ? `0 0 30px ${colors.glow}, 0 0 60px rgba(139,120,255,0.15)`
            : `0 4px 20px rgba(0,0,0,0.2)`,
          transition: 'border-color 0.3s, box-shadow 0.3s',
          maxWidth: '340px',
          cursor: 'pointer',
          opacity: stickinessOpacity,
        }}
      >
        {/* 角色标识 + 情绪标签 */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className="text-sm" title={persona.name}>{persona.emoji}</span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: colors.text,
            }}
          >
            {persona.shortName}
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(200,200,230,0.5)',
            }}
          >
            {distortionName}
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(200,200,230,0.4)',
            }}
          >
            {emotionName}
          </span>
          {/* 强度指示 */}
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(200,200,230,0.3)',
            }}
          >
            强度 {thought.intensity}
          </span>
        </div>

        {/* 念头内容 */}
        <p
          className="text-sm leading-relaxed"
          style={{
            color: thought.rewrittenContent ? 'rgba(180,220,180,0.9)' : 'rgba(230,230,250,0.85)',
          }}
        >
          {displayContent}
        </p>

        {/* 标签 */}
        {thought.tags && thought.tags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {thought.tags.map((tag, i) => (
              <span
                key={i}
                className="text-[9px] px-1.5 py-0.5 rounded-full"
                style={{
                  background: 'rgba(139,120,255,0.1)',
                  color: 'rgba(139,120,255,0.6)',
                  border: '1px solid rgba(139,120,255,0.15)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 改写标识 */}
        {thought.rewrittenContent && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-[10px]" style={{ color: 'rgba(139,220,180,0.6)' }}>
              ✏️ 已改写
            </span>
          </div>
        )}

        {/* 选中指示器 */}
        {isSelected && (
          <motion.div
            layoutId="selector"
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
            style={{
              background: 'linear-gradient(90deg, rgba(139,120,255,0.8), rgba(100,180,255,0.8))',
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
});

export default ThoughtBubble;
