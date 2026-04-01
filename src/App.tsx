/**
 * App 主组件 — 柔和治愈风
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
    const initialHeight = window.innerHeight;
    setLayoutHeight(initialHeight);

    const vv = window.visualViewport;
    if (!vv) return;

    const handleResize = () => {
      const currentHeight = vv.height;
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
  const isDarkTheme = currentTheme === 'starry';

  useEffect(() => {
    init();
    preloadVoices();
    const handler = () => preloadVoices();
    window.addEventListener('click', handler, { once: true });
    return () => window.removeEventListener('click', handler);
  }, [init]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#F8F6FF' }}>
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl mb-6"
          >
            🎭
          </motion.div>
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-sm"
            style={{ color: '#8B7CF7' }}
          >
            正在准备...
          </motion.p>
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
        color: isDarkTheme ? '#e0e8f0' : '#2D2B55',
        transition: 'background 0.6s ease, color 0.6s ease',
      }}
    >
      {/* 柔和背景装饰 */}
      {!isDarkTheme && <div className="soft-bg" />}

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
                    color: 'rgba(139,124,247,0.5)',
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
