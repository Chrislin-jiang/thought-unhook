/**
 * 漂浮气泡 — 赛博科技 + 圆润气泡
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

/** 根据释放方式返回不同的 exit 动画 */
function getExitAnimation(method: ReleaseMethod | null) {
  switch (method) {
    case 'blow':
      // 云朵向右上方飘远
      return {
        opacity: [1, 0.9, 0.6, 0.2, 0],
        y: [0, -40, -120, -250, -420],
        x: [0, 30, 80, 160, 280],
        scale: [1, 1.02, 0.85, 0.55, 0.25],
        transition: {
          duration: 2.0,
          ease: [0.1, 0.5, 0.3, 1],
        },
      };
    case 'melt':
      // 向下流淌滑落
      return {
        opacity: [1, 0.85, 0.6, 0.25, 0],
        y: [0, 20, 80, 180, 320],
        scaleX: [1, 1.06, 1.15, 1.1, 0.8],
        scaleY: [1, 0.9, 0.6, 0.3, 0.06],
        filter: ['blur(0px)', 'blur(0px)', 'blur(2px)', 'blur(5px)', 'blur(10px)'],
        transition: {
          duration: 1.8,
          ease: [0.4, 0, 0.7, 0.2],
        },
      };
    case 'resize':
      return {
        opacity: [1, 0.7, 0.3, 0],
        scale: [1, 0.6, 0.25, 0.05],
        y: [0, -15, -25, -30],
        filter: ['blur(0px)', 'blur(1px)', 'blur(3px)', 'blur(6px)'],
        transition: {
          duration: 1.0,
          ease: [0.4, 0, 1, 1],
        },
      };
    default:
      return {
        opacity: 0,
        scale: 0.3,
        filter: 'brightness(2) blur(6px)',
        transition: { duration: 0.4 },
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
  const floatY = 8 + (index % 4) * 4;
  const floatX = ((index % 2 === 0) ? 1 : -1) * (2 + (index % 3) * 2);
  const displayContent = thought.rewrittenContent || thought.content;
  const offsetX = index % 2 === 0 ? '-8%' : '8%';

  const exitAnim = isSelected ? getExitAnimation(releasingMethod) : getExitAnimation(null);
  const isBlowing = isSelected && releasingMethod === 'blow';
  const isMelting = isSelected && releasingMethod === 'melt';

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={exitAnim}
      whileTap={{ scale: 0.97 }}
      onClick={() => selectThought(isSelected ? null : thought.uid)}
      className="thought-bubble"
      style={{ position: 'relative', transform: `translateX(${offsetX})`, overflow: 'visible' }}
    >
      <div className="bubble-glow" style={{ background: colors.glow }} />

      {/* 吹走时：卡通云朵 SVG 覆盖整个气泡 */}
      <AnimatePresence>
        {isBlowing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: '-28px -20px -12px -20px',
              zIndex: 0,
              pointerEvents: 'none',
            }}
          >
            <svg viewBox="0 0 200 120" fill="none" style={{ width: '100%', height: '100%' }}>
              <defs>
                <radialGradient id="cloud-grad" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="rgba(225,240,255,0.3)" />
                  <stop offset="100%" stopColor="rgba(200,220,250,0.08)" />
                </radialGradient>
                <filter id="cloud-soft">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
                </filter>
              </defs>
              {/* 主体云朵 — 多个重叠椭圆组合 */}
              <g filter="url(#cloud-soft)">
                {/* 底部长椭圆 */}
                <ellipse cx="100" cy="82" rx="88" ry="30" fill="url(#cloud-grad)" />
                {/* 左下团 */}
                <ellipse cx="42" cy="68" rx="36" ry="32" fill="url(#cloud-grad)" />
                {/* 中左上团 */}
                <ellipse cx="68" cy="42" rx="34" ry="30" fill="url(#cloud-grad)" />
                {/* 中央顶团（最高） */}
                <ellipse cx="105" cy="30" rx="38" ry="32" fill="url(#cloud-grad)" />
                {/* 中右上团 */}
                <ellipse cx="140" cy="44" rx="30" ry="28" fill="url(#cloud-grad)" />
                {/* 右下团 */}
                <ellipse cx="158" cy="66" rx="34" ry="30" fill="url(#cloud-grad)" />
                {/* 填充中间区域 */}
                <ellipse cx="100" cy="58" rx="70" ry="35" fill="url(#cloud-grad)" />
              </g>
              {/* 高光 */}
              <ellipse cx="80" cy="38" rx="22" ry="14" fill="rgba(255,255,255,0.06)" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={isBlowing ? {
          background: 'rgba(218, 235, 255, 0.12)',
          borderColor: 'rgba(200, 220, 255, 0.06)',
          boxShadow: '0 4px 40px rgba(200, 220, 255, 0.1)',
          scale: 1.05,
        } : isMelting ? {
          background: 'rgba(255, 200, 160, 0.15)',
          borderColor: 'rgba(255, 180, 130, 0.12)',
          boxShadow: '0 8px 30px rgba(255, 160, 100, 0.1)',
          borderRadius: '28px 28px 40% 40%',
          scaleX: 1.06,
        } : {
          y: [0, -floatY, 0],
          x: [0, floatX, 0],
        }}
        transition={isBlowing
          ? { duration: 0.5, ease: 'easeOut' }
          : isMelting
            ? { duration: 0.7, ease: 'easeOut' }
            : { duration: floatDuration, ease: 'easeInOut', repeat: Infinity, delay: floatDelay }
        }
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
          overflow: 'visible',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* 融化时：底部流淌液滴 SVG */}
        <AnimatePresence>
          {isMelting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              style={{
                position: 'absolute',
                bottom: '-35px', left: '-4px', right: '-4px',
                height: '45px',
                zIndex: 0, pointerEvents: 'none',
              }}
            >
              <svg viewBox="0 0 200 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="drip-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,180,130,0.2)" />
                    <stop offset="100%" stopColor="rgba(255,160,100,0.02)" />
                  </linearGradient>
                </defs>
                {/* 波浪顶部连接 */}
                <motion.path
                  d="M0,0 Q20,0 30,4 Q40,8 50,3 Q65,0 80,5 Q95,10 110,4 Q125,0 140,6 Q155,10 170,3 Q185,0 200,0 L200,2 L0,2 Z"
                  fill="rgba(255,180,130,0.15)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                {/* 液滴1 — 左侧长滴 */}
                <motion.path
                  d="M30,2 Q28,2 28,6 Q28,14 32,22 Q34,28 32,32 Q30,36 32,36 Q34,36 34,32 Q36,28 36,22 Q36,14 34,6 Q34,2 32,2 Z"
                  fill="url(#drip-grad)"
                  initial={{ scaleY: 0, originY: 0 }}
                  animate={{ scaleY: [0, 0.6, 1, 1.1] }}
                  transition={{ duration: 1.2, delay: 0.3, ease: 'easeIn' }}
                />
                {/* 液滴2 — 中间粗滴 */}
                <motion.path
                  d="M95,2 Q91,2 90,8 Q89,16 92,26 Q94,32 93,37 Q92,40 96,40 Q100,40 99,36 Q98,32 100,26 Q103,16 102,8 Q101,2 97,2 Z"
                  fill="url(#drip-grad)"
                  initial={{ scaleY: 0, originY: 0 }}
                  animate={{ scaleY: [0, 0.4, 0.9, 1.15] }}
                  transition={{ duration: 1.4, delay: 0.5, ease: 'easeIn' }}
                />
                {/* 液滴3 — 右侧细滴 */}
                <motion.path
                  d="M155,2 Q153,2 153,5 Q153,12 155,20 Q156,26 155,30 Q154,33 156,33 Q158,33 157,30 Q156,26 157,20 Q159,12 159,5 Q159,2 157,2 Z"
                  fill="url(#drip-grad)"
                  initial={{ scaleY: 0, originY: 0 }}
                  animate={{ scaleY: [0, 0.5, 1, 1.05] }}
                  transition={{ duration: 1.0, delay: 0.7, ease: 'easeIn' }}
                />
                {/* 液滴4 — 左侧小滴 */}
                <motion.path
                  d="M60,3 Q59,3 59,6 Q59,10 60,15 Q61,18 60,20 Q59,21 61,21 Q62,21 62,18 Q62,15 63,10 Q63,6 63,3 Z"
                  fill="url(#drip-grad)"
                  initial={{ scaleY: 0, originY: 0 }}
                  animate={{ scaleY: [0, 0.7, 1] }}
                  transition={{ duration: 0.9, delay: 0.9, ease: 'easeIn' }}
                />
                {/* 液滴5 — 右侧小滴 */}
                <motion.path
                  d="M130,2 Q129,2 129,5 Q129,9 130,14 Q131,17 130,19 Q130,20 131,20 Q132,20 132,17 Q132,14 133,9 Q133,5 133,2 Z"
                  fill="url(#drip-grad)"
                  initial={{ scaleY: 0, originY: 0 }}
                  animate={{ scaleY: [0, 0.6, 1] }}
                  transition={{ duration: 0.8, delay: 0.6, ease: 'easeIn' }}
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 融化时：🫠 emoji */}
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
                filter: 'drop-shadow(0 0 8px rgba(255,180,100,0.3))',
                pointerEvents: 'none',
              }}
            >
              🫠
            </motion.div>
          )}
        </AnimatePresence>
        {/* 吹走时中央云朵符号 */}
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
                filter: 'drop-shadow(0 0 10px rgba(200,220,255,0.4))',
                pointerEvents: 'none',
              }}
            >
              ☁️
            </motion.div>
          )}
        </AnimatePresence>

        {/* 标签行 */}
        <motion.div
          className="flex items-center gap-2 mb-1.5"
          animate={{ opacity: (isBlowing || isMelting) ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-xs">{persona.emoji}</span>
          <span className="text-[10px]" style={{ color: colors.text, opacity: 0.85 }}>
            {emotionName}
          </span>
          <span className="text-[9px] font-mono ml-auto" style={{ color: 'rgba(0,240,255,0.2)' }}>
            LV.{thought.intensity}
          </span>
        </motion.div>

        {/* 内容 */}
        <motion.p
          className="text-[13px] leading-relaxed"
          animate={{ opacity: (isBlowing || isMelting) ? 0 : 1 }}
          transition={{ duration: 0.4 }}
          style={{
            color: thought.rewrittenContent
              ? 'rgba(0,255,136,0.85)'
              : 'rgba(220,230,245,0.88)',
          }}
        >
          {displayContent}
        </motion.p>

        {/* 标签 */}
        {thought.tags && thought.tags.length > 0 && !isBlowing && !isMelting && (
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
        {isSelected && !isBlowing && !isMelting && (
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
        {isSelected && !isBlowing && !isMelting && (
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
