/**
 * 顶部导航 — 极简信息栏
 */

import { motion } from 'framer-motion';
import { useThoughtStore } from '../store';

export default function Header() {
  const thoughts = useThoughtStore(s => s.thoughts);
  const releasedCount = thoughts.filter(t => t.status === 'released').length;
  const activeCount = thoughts.filter(t => t.status === 'active').length;

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 px-5 pt-5 pb-3 flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">🫧</span>
        <h1
          className="text-base font-medium tracking-wide"
          style={{ color: 'rgba(200,200,230,0.7)' }}
        >
          念头解钩器
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {activeCount > 0 && (
          <span className="text-xs" style={{ color: 'rgba(200,200,230,0.35)' }}>
            {activeCount} 个念头漂浮中
          </span>
        )}
        {releasedCount > 0 && (
          <span className="text-xs" style={{ color: 'rgba(139,220,180,0.4)' }}>
            💨 已释放 {releasedCount}
          </span>
        )}
      </div>
    </motion.header>
  );
}
