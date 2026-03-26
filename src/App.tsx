/**
 * App 主组件 — Phase 1 MVP
 * 
 * 多页面（Tab导航）：念头空间 / 觉察日志 / 睡前模式
 * + Onboarding 引导流程
 */

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import StarryBackground from './components/StarryBackground';
import Header from './components/Header';
import ThoughtSpace from './components/ThoughtSpace';
import ThoughtInput from './components/ThoughtInput';
import ActionPanel from './components/ActionPanel';
import AwarenessJournal from './components/AwarenessJournal';
import NightMode from './components/NightMode';
import Onboarding from './components/Onboarding';
import TabBar from './components/TabBar';
import StoredThoughts from './components/StoredThoughts';
import { useThoughtStore } from './store';
import { preloadVoices } from './ai-service';

export default function App() {
  const selectedId = useThoughtStore(s => s.selectedThoughtId);
  const thoughts = useThoughtStore(s => s.thoughts);
  const hasActive = thoughts.some(t => t.status === 'active');
  const currentPage = useThoughtStore(s => s.currentPage);
  const onboardingCompleted = useThoughtStore(s => s.onboardingCompleted);
  const init = useThoughtStore(s => s.init);
  const isLoading = useThoughtStore(s => s.isLoading);
  const [showStored, setShowStored] = useState(false);

  useEffect(() => {
    init();
    preloadVoices();
    const handler = () => preloadVoices();
    window.addEventListener('click', handler, { once: true });
    return () => window.removeEventListener('click', handler);
  }, [init]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#0a0a1a' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🫧</div>
          <p style={{ color: 'rgba(200,200,230,0.5)' }}>正在加载...</p>
        </div>
      </div>
    );
  }

  if (!onboardingCompleted) {
    return <Onboarding />;
  }

  return (
    <div className="h-screen flex flex-col relative" style={{ background: '#0a0a1a', minHeight: '100dvh' }}>
      <StarryBackground />
      <Header />

      {/* 主内容区 */}
      <AnimatePresence mode="wait">
        {currentPage === 'space' && (
          <div className="flex-1 flex flex-col overflow-hidden" key="space">
            <ThoughtSpace />

            {/* 底部操作区 */}
            <div className="relative z-10 px-4 pb-2 space-y-3">
              <AnimatePresence>
                {selectedId && hasActive && <ActionPanel />}
              </AnimatePresence>
              <ThoughtInput />
              
              {/* 暂存按钮 */}
              {thoughts.some(t => t.status === 'stored') && (
                <button
                  onClick={() => setShowStored(!showStored)}
                  className="w-full text-center py-1"
                  style={{ color: 'rgba(200,200,230,0.3)', fontSize: '12px' }}
                >
                  📌 念头罐（{thoughts.filter(t => t.status === 'stored').length}）
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

        {currentPage === 'night' && (
          <div className="flex-1 overflow-hidden" key="night">
            <NightMode />
          </div>
        )}
      </AnimatePresence>

      {/* 底部 Tab 栏 */}
      <TabBar />
    </div>
  );
}
