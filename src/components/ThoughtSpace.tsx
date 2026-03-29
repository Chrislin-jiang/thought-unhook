/**
 * 念头空间 — 赛博科技风
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useThoughtStore } from '../store';
import ThoughtBubble from './ThoughtBubble';
import type { MouseEvent } from 'react';

export default function ThoughtSpace() {
  const thoughts = useThoughtStore(s => s.thoughts);
  const selectedId = useThoughtStore(s => s.selectedThoughtId);
  const selectThought = useThoughtStore(s => s.selectThought);
  const activeThoughts = thoughts.filter(t => t.status === 'active');

  /** 点击空白区域取消选中，关闭操作面板 */
  const handleBackgroundClick = (e: MouseEvent) => {
    // 只在点击的是容器本身（空白处）时触发，气泡内部点击由自身处理
    if (e.target === e.currentTarget && selectedId) {
      selectThought(null);
    }
  };

  return (
    <div
      className="flex-1 relative overflow-y-auto overflow-x-hidden px-5 py-4"
      onClick={handleBackgroundClick}
    >
      {activeThoughts.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          className="flex flex-col items-center gap-5 pb-4"
          onClick={handleBackgroundClick}
        >
          <AnimatePresence mode="popLayout">
            {activeThoughts.map((thought, index) => (
              <ThoughtBubble key={thought.uid} thought={thought} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      {/* 六边形装饰 */}
      <motion.div
        animate={{
          rotate: [0, 360],
          opacity: [0.08, 0.15, 0.08],
        }}
        transition={{
          rotate: { duration: 30, repeat: Infinity, ease: 'linear' },
          opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{
          width: '120px',
          height: '120px',
          border: '1px solid rgba(0,240,255,0.1)',
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        }}
      />

      <div className="text-center space-y-3 -mt-16">
        <motion.p
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-sm font-mono tracking-wider"
          style={{ color: 'rgba(0,240,255,0.35)' }}
        >
          CURTAIN UP_
        </motion.p>
        <p className="text-[11px]" style={{ color: 'rgba(200,220,240,0.2)' }}>
          幕布已拉开，等待第一句台词
        </p>
      </div>
    </div>
  );
}
