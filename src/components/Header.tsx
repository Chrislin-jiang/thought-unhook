/**
 * 顶部导航 — Phase 3 增强
 * 含主题选择器 + 分享按钮
 */

import { motion } from 'framer-motion';
import { useThoughtStore } from '../store';
import ThemeSelector from './ThemeSelector';

export default function Header() {
  const thoughts = useThoughtStore(s => s.thoughts);
  const currentPage = useThoughtStore(s => s.currentPage);
  const setShowSharePanel = useThoughtStore(s => s.setShowSharePanel);
  const currentTheme = useThoughtStore(s => s.currentTheme);
  const releasedCount = thoughts.filter(t => t.status === 'released').length;
  const activeCount = thoughts.filter(t => t.status === 'active').length;
  const storedCount = thoughts.filter(t => t.status === 'stored').length;

  const isVoidTheme = currentTheme === 'void';

  const pageTitle: Record<string, string> = {
    space: '念头空间',
    journal: '觉察日志',
    lab: '解钩实验室',
    night: '睡前模式',
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-30 px-5 pt-5 pb-3 flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">
          {currentPage === 'space' ? '🫧' : currentPage === 'journal' ? '📊' : currentPage === 'lab' ? '🧪' : '🌙'}
        </span>
        <h1
          className="text-base font-medium tracking-wide"
          style={{ color: isVoidTheme ? 'rgba(220,200,170,0.7)' : 'rgba(200,200,230,0.7)' }}
        >
          {pageTitle[currentPage] || '念头解钩器'}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {currentPage === 'space' && (
          <div className="flex items-center gap-3 mr-2">
            {activeCount > 0 && (
              <span className="text-xs" style={{ color: isVoidTheme ? 'rgba(220,200,170,0.4)' : 'rgba(200,200,230,0.35)' }}>
                {activeCount} 个漂浮中
              </span>
            )}
            {storedCount > 0 && (
              <span className="text-xs" style={{ color: 'rgba(255,200,100,0.4)' }}>
                📌 {storedCount}
              </span>
            )}
            {releasedCount > 0 && (
              <span className="text-xs" style={{ color: 'rgba(139,220,180,0.4)' }}>
                💨 {releasedCount}
              </span>
            )}
          </div>
        )}

        {/* 分享按钮 */}
        {currentPage === 'journal' && thoughts.length > 0 && (
          <motion.button
            onClick={() => setShowSharePanel(true)}
            whileTap={{ scale: 0.92 }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(200,200,230,0.6)',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <span>📤</span>
            <span>分享</span>
          </motion.button>
        )}

        {/* 主题选择器 */}
        <ThemeSelector />
      </div>
    </motion.header>
  );
}
