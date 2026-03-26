/**
 * 解钩实验室 — Phase 2.1
 * 
 * 7个引导练习的列表页 + 子练习入口
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PRACTICE_LIST } from '../types';
import type { PracticeType } from '../types';
import { useThoughtStore } from '../store';
import ThoughtTrain from './practices/ThoughtTrain';
import ThoughtTV from './practices/ThoughtTV';
import CloudWriting from './practices/CloudWriting';
import BalloonRelease from './practices/BalloonRelease';
import DriftBottle from './practices/DriftBottle';
import Microscope from './practices/Microscope';
import MeetPersonas from './practices/MeetPersonas';

export default function UnhookLab() {
  const [activePractice, setActivePractice] = useState<PracticeType | null>(null);
  const practiceRecords = useThoughtStore(s => s.practiceRecords);

  const getPracticeCount = (type: PracticeType) => {
    return practiceRecords.filter(r => r.type === type).length;
  };

  if (activePractice) {
    return (
      <PracticeRouter
        type={activePractice}
        onBack={() => setActivePractice(null)}
      />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 relative z-10">
      {/* 头部介绍 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <p className="text-sm" style={{ color: 'rgba(200,200,230,0.6)' }}>
          基于ACT和正念的结构化练习
        </p>
        <p className="text-xs mt-1" style={{ color: 'rgba(200,200,230,0.3)' }}>
          每个练习都是一次认知解离的旅程
        </p>
      </motion.div>

      {/* 练习列表 */}
      <div className="space-y-3">
        {PRACTICE_LIST.map((practice, i) => {
          const count = getPracticeCount(practice.type);
          return (
            <motion.button
              key={practice.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => setActivePractice(practice.type)}
              className="w-full text-left p-4 rounded-2xl flex items-start gap-4 transition-all"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
              }}
              whileHover={{ scale: 1.01, background: 'rgba(255,255,255,0.06)' }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-3xl mt-0.5">{practice.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium" style={{ color: 'rgba(230,230,250,0.9)' }}>
                    {practice.name}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{
                    background: 'rgba(139,120,255,0.1)',
                    color: 'rgba(139,120,255,0.6)',
                  }}>
                    {practice.duration}
                  </span>
                  {practice.type === 'meet-personas' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{
                      background: 'rgba(255,200,100,0.1)',
                      color: 'rgba(255,200,100,0.6)',
                    }}>
                      ✨ 特别练习
                    </span>
                  )}
                </div>
                <p className="text-xs mb-1" style={{ color: 'rgba(200,200,230,0.5)' }}>
                  {practice.description}
                </p>
                <p className="text-[10px]" style={{ color: 'rgba(200,200,230,0.3)' }}>
                  {practice.mechanism}
                </p>
                {count > 0 && (
                  <p className="text-[10px] mt-1" style={{ color: 'rgba(139,220,180,0.5)' }}>
                    已完成 {count} 次
                  </p>
                )}
              </div>
              <span className="text-lg mt-1" style={{ color: 'rgba(200,200,230,0.2)' }}>›</span>
            </motion.button>
          );
        })}
      </div>

      <div className="h-4" />
    </div>
  );
}

// ===== 练习路由 =====
function PracticeRouter({ type, onBack }: { type: PracticeType; onBack: () => void }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={type}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex-1 flex flex-col overflow-hidden"
      >
        {type === 'thought-train' && <ThoughtTrain onBack={onBack} />}
        {type === 'thought-tv' && <ThoughtTV onBack={onBack} />}
        {type === 'cloud-writing' && <CloudWriting onBack={onBack} />}
        {type === 'balloon-release' && <BalloonRelease onBack={onBack} />}
        {type === 'drift-bottle' && <DriftBottle onBack={onBack} />}
        {type === 'microscope' && <Microscope onBack={onBack} />}
        {type === 'meet-personas' && <MeetPersonas onBack={onBack} />}
      </motion.div>
    </AnimatePresence>
  );
}
