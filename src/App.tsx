/**
 * App 主组件 — Phase 3
 */

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
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
      <div className="h-screen flex items-center justify-center" style={{ background: '#08080f' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-breathe" style={{ color: 'rgba(139,124,247,0.5)' }}>🫧</div>
          <p style={{ color: 'rgba(200,200,230,0.3)', letterSpacing: '0.2em', fontSize: '12px' }}>静候片刻...</p>
        </div>
      </div>
    );
  }

  if (!onboardingCompleted) {
    return <Onboarding />;
  }

  return (
    <div
      className="h-screen flex flex-col relative"
      style={{
        background: themeInfo.bgColor,
        minHeight: '100dvh',
        color: '#d0d0e8',
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

              {thoughts.some(t => t.status === 'stored') && (
                <button
                  onClick={() => setShowStored(!showStored)}
                  className="w-full text-center py-1"
                  style={{
                    color: 'rgba(139,124,247,0.4)',
                    fontSize: '12px',
                  }}
                >
                  念头罐（{thoughts.filter(t => t.status === 'stored').length}）
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
          <div className="flex-1 overflow-hidden" key="journal">
            <AwarenessJournal />
          </div>
        )}

        {currentPage === 'lab' && (
          <div className="flex-1 overflow-hidden" key="lab">
            <UnhookLab />
          </div>
        )}

        {currentPage === 'night' && (
          <div className="flex-1 overflow-hidden" key="night">
            <NightMode />
          </div>
        )}
      </AnimatePresence>

      <TabBar />
      <SharePanel />
    </div>
  );
}
