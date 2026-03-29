/**
 * App 主组件 — Phase 3
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ThemeBackground from './components/ThemeBackground';
import Header from './components/Header';
import ThoughtSpace from './components/ThoughtSpace';
import ThoughtInput from './components/ThoughtInput';
import ActionPanel from './components/ActionPanel';
import AwarenessJournal from './components/AwarenessJournal';
import NightMode from './components/NightMode';
import UnhookLab from './components/UnhookLab';
import Onboarding from './components/Onboarding';
import TabBar from './components/TabBar';
import StoredThoughts from './components/StoredThoughts';
import SharePanel from './components/SharePanel';
import { useThoughtStore } from './store';
import { preloadVoices } from './ai-service';
import { THEME_INFO } from './types';

/** 检测 iOS 键盘是否弹起 */
function useKeyboardVisible() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [layoutHeight, setLayoutHeight] = useState<number | null>(null);

  useEffect(() => {
    // 记录初始的 viewport 高度（无键盘时）
    const initialHeight = window.innerHeight;
    setLayoutHeight(initialHeight);

    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      const currentHeight = vv.height;
      // 键盘弹起时 visualViewport 高度会明显小于初始高度
      const keyboardUp = initialHeight - currentHeight > 100;
      setIsKeyboardVisible(keyboardUp);
    };

    vv.addEventListener('resize', handleResize);
    return () => vv.removeEventListener('resize', handleResize);
  }, []);

  return { isKeyboardVisible, layoutHeight };
}

export default function App() {
  const selectedId = useThoughtStore(s => s.selectedThoughtId);
  const thoughts = useThoughtStore(s => s.thoughts);
  const hasActive = thoughts.some(t => t.status === 'active');
  const currentPage = useThoughtStore(s => s.currentPage);
  const onboardingCompleted = useThoughtStore(s => s.onboardingCompleted);
  const init = useThoughtStore(s => s.init);
  const isLoading = useThoughtStore(s => s.isLoading);
  const currentTheme = useThoughtStore(s => s.currentTheme);
  const [showStored, setShowStored] = useState(false);
  const { isKeyboardVisible, layoutHeight } = useKeyboardVisible();

  const themeInfo = THEME_INFO[currentTheme];

  useEffect(() => {
    init();
    preloadVoices();
    const handler = () => preloadVoices();
    window.addEventListener('click', handler, { once: true });
    return () => window.removeEventListener('click', handler);
  }, [init]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#050510' }}>
        <div className="text-center">
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="font-mono text-sm mb-4"
            style={{ color: '#00f0ff', textShadow: '0 0 10px rgba(0,240,255,0.3)' }}
          >
            INITIALIZING...
          </motion.div>
          <div className="w-32 h-[2px] mx-auto overflow-hidden" style={{ background: 'rgba(0,240,255,0.1)' }}>
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-1/2 h-full"
              style={{ background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)' }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!onboardingCompleted) {
    return <Onboarding />;
  }

  return (
    <div
      className="flex flex-col relative overflow-hidden"
      style={{
        background: themeInfo.bgColor,
        height: layoutHeight ? `${layoutHeight}px` : '100dvh',
        color: '#e0e8f0',
        transition: 'background 0.8s ease, color 0.8s ease',
      }}
    >
      <ThemeBackground theme={currentTheme} />
      <Header />

      <AnimatePresence mode="wait">
        {currentPage === 'space' && (
          <div className="flex-1 flex flex-col overflow-hidden" key="space">
            <ThoughtSpace />

            <div className="relative z-10 px-4 pb-1 space-y-1.5 overflow-auto">
              <AnimatePresence>
                {selectedId && hasActive && <ActionPanel />}
              </AnimatePresence>
              <ThoughtInput />

              {!isKeyboardVisible && thoughts.some(t => t.status === 'stored') && (
                <button
                  onClick={() => setShowStored(!showStored)}
                  className="w-full text-center py-1"
                  style={{
                    color: 'rgba(139,124,247,0.4)',
                    fontSize: '12px',
                  }}
                >
                  剧本库（{thoughts.filter(t => t.status === 'stored').length}）
                  {showStored ? ' ▲' : ' ▼'}
                </button>
              )}
            </div>

            <AnimatePresence>
              {showStored && <StoredThoughts />}
            </AnimatePresence>
          </div>
        )}

        {currentPage === 'journal' && (
          <div className="flex-1 flex flex-col overflow-hidden" key="journal">
            <AwarenessJournal />
          </div>
        )}

        {currentPage === 'lab' && (
          <div className="flex-1 flex flex-col overflow-hidden" key="lab">
            <UnhookLab />
          </div>
        )}

        {currentPage === 'night' && (
          <div className="flex-1 flex flex-col overflow-hidden" key="night">
            <NightMode />
          </div>
        )}
      </AnimatePresence>

      {!isKeyboardVisible && <TabBar />}
      <SharePanel />
    </div>
  );
}
