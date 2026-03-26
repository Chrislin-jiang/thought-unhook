/**
 * 主题选择器 — Phase 3
 * 支持切换 4 种主题背景
 * 使用 Portal 渲染下拉面板，避免 z-index stacking context 问题
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useThoughtStore } from '../store';
import { THEME_INFO } from '../types';
import type { ThemeType } from '../types';

export default function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const currentTheme = useThoughtStore(s => s.currentTheme);
  const setTheme = useThoughtStore(s => s.setTheme);
  const currentInfo = THEME_INFO[currentTheme];

  const themes: ThemeType[] = ['starry', 'ocean', 'forest', 'void'];

  // 计算下拉菜单位置
  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  return (
    <div className="relative">
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
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
        <span>{currentInfo.emoji}</span>
        <span>{currentInfo.name}</span>
      </motion.button>

      {/* Portal 渲染到 body，避免被 stacking context 遮挡 */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* 背景遮罩 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 9998,
                }}
                onClick={() => setIsOpen(false)}
              />
              
              {/* 选择面板 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'fixed',
                  top: menuPos.top,
                  right: menuPos.right,
                  zIndex: 9999,
                  padding: '8px',
                  borderRadius: '12px',
                  background: currentTheme === 'void'
                    ? 'rgba(30,25,18,0.98)'
                    : 'rgba(20,20,40,0.98)',
                  border: currentTheme === 'void'
                    ? '1px solid rgba(200,170,120,0.12)'
                    : '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  minWidth: '160px',
                  boxShadow: currentTheme === 'void'
                    ? '0 8px 32px rgba(0,0,0,0.5)'
                    : '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                <p
                  className="text-[10px] px-2 py-1 mb-1"
                  style={{ color: currentTheme === 'void' ? 'rgba(200,180,140,0.5)' : 'rgba(200,200,230,0.4)' }}
                >
                  选择主题背景
                </p>
                {themes.map(theme => {
                  const info = THEME_INFO[theme];
                  const isActive = currentTheme === theme;
                  return (
                    <motion.button
                      key={theme}
                      onClick={() => {
                        setTheme(theme);
                        setIsOpen(false);
                      }}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left"
                      style={{
                        background: isActive
                          ? (currentTheme === 'void' ? 'rgba(200,160,80,0.15)' : 'rgba(139,120,255,0.15)')
                          : 'transparent',
                        border: 'none',
                        color: currentTheme === 'void'
                          ? (isActive ? 'rgba(230,210,170,0.9)' : 'rgba(200,180,140,0.6)')
                          : (isActive ? 'rgba(200,200,230,0.9)' : 'rgba(200,200,230,0.6)'),
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span className="text-lg">{info.emoji}</span>
                      <div>
                        <div className="text-sm">{info.name}</div>
                        <div
                          className="text-[10px]"
                          style={{
                            color: currentTheme === 'void'
                              ? 'rgba(200,180,140,0.4)'
                              : 'rgba(200,200,230,0.35)',
                          }}
                        >
                          {info.description}
                        </div>
                      </div>
                      {isActive && (
                        <span className="ml-auto text-xs" style={{ color: 'rgba(139,120,255,0.8)' }}>✓</span>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
