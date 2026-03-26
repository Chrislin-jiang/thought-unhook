/**
 * 📺 念头电视 — 念头变成字幕，手持遥控器操作
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import PracticeShell from './PracticeShell';

export default function ThoughtTV({ onBack }: { onBack: () => void }) {
  return (
    <PracticeShell
      type="thought-tv"
      title="念头电视"
      emoji="📺"
      introText="想象你面前有一台电视机，你的念头正在屏幕上播放。"
      introSubText="你手持遥控器——可以调台、静音、甚至关机。你是观众，不是演员。"
      onBack={onBack}
      maxThoughts={3}
    >
      {({ thoughts, phase, setPhase }) => (
        <TVAnimation thoughts={thoughts} phase={phase} setPhase={setPhase} onBack={onBack} />
      )}
    </PracticeShell>
  );
}

function TVAnimation({
  thoughts,
  phase,
  setPhase,
  onBack,
}: {
  thoughts: string[];
  phase: string;
  setPhase: (p: 'animation' | 'breathe' | 'done') => void;
  onBack: () => void;
}) {
  const [currentChannel, setCurrentChannel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOff, setIsOff] = useState(false);
  const [volume, setVolume] = useState(100);

  const handleChannelChange = useCallback(() => {
    setCurrentChannel(prev => (prev + 1) % thoughts.length);
  }, [thoughts.length]);

  const handleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const handleTurnOff = useCallback(() => {
    setIsOff(true);
    setTimeout(() => setPhase('done'), 2000);
  }, [setPhase]);

  // 自动音量递减
  useEffect(() => {
    if (phase !== 'animation' || isOff) return;
    const timer = setInterval(() => {
      setVolume(prev => {
        if (prev <= 10) return prev;
        return prev - 5;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [phase, isOff]);

  if (phase === 'done') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-5xl mb-6">📺</motion.div>
        <p className="text-lg text-center mb-2" style={{ color: 'rgba(200,200,230,0.8)' }}>电视关了</p>
        <p className="text-xs text-center mb-6" style={{ color: 'rgba(200,200,230,0.4)' }}>
          那些念头只是屏幕上的字幕，关了电视它们就消失了。
        </p>
        <button onClick={onBack} className="px-6 py-2.5 rounded-full text-sm" style={{
          background: 'rgba(255,255,255,0.05)', color: 'rgba(200,200,230,0.5)',
          border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
        }}>返回实验室</button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      {/* 电视屏幕 */}
      <motion.div
        animate={isOff ? { scaleY: 0.01, opacity: 0 } : { scaleY: 1, opacity: 1 }}
        transition={{ duration: isOff ? 0.5 : 0.3 }}
        className="w-full max-w-xs rounded-2xl p-6 mb-6 relative"
        style={{
          background: 'rgba(20,20,50,0.8)',
          border: '2px solid rgba(100,100,150,0.3)',
          boxShadow: '0 0 30px rgba(100,100,200,0.1), inset 0 0 30px rgba(0,0,0,0.3)',
          minHeight: '160px',
        }}
      >
        {/* 频道号 */}
        <div className="absolute top-3 right-3 text-[10px]" style={{ color: 'rgba(200,200,230,0.3)' }}>
          CH {currentChannel + 1}
        </div>

        {/* 内容 */}
        <div className="flex items-center justify-center h-full min-h-[100px]">
          <motion.p
            key={currentChannel}
            initial={{ opacity: 0 }}
            animate={{ opacity: isMuted ? 0.2 : volume / 100 }}
            className="text-sm text-center leading-relaxed"
            style={{
              color: isMuted ? 'rgba(200,200,230,0.2)' : 'rgba(200,200,230,0.8)',
              filter: isMuted ? 'blur(2px)' : 'none',
            }}
          >
            {thoughts[currentChannel]}
          </motion.p>
        </div>

        {/* 静音标识 */}
        {isMuted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-3 left-3 text-xl"
          >
            🔇
          </motion.div>
        )}

        {/* 音量条 */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
          <span className="text-[10px]" style={{ color: 'rgba(200,200,230,0.3)' }}>🔊</span>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              animate={{ width: `${isMuted ? 0 : volume}%` }}
              className="h-full rounded-full"
              style={{ background: 'rgba(139,120,255,0.4)' }}
            />
          </div>
        </div>
      </motion.div>

      {/* 遥控器 */}
      <div className="flex gap-3">
        <RemoteButton emoji="📡" label="调台" onClick={handleChannelChange} disabled={isOff} />
        <RemoteButton emoji={isMuted ? '🔇' : '🔊'} label={isMuted ? '取消静音' : '静音'} onClick={handleMute} disabled={isOff} />
        <RemoteButton emoji="⏏️" label="关机" onClick={handleTurnOff} disabled={isOff} accent />
      </div>

      <p className="text-xs mt-4" style={{ color: 'rgba(200,200,230,0.3)' }}>
        你是观众，不是节目里的角色
      </p>
    </div>
  );
}

function RemoteButton({ emoji, label, onClick, disabled, accent }: {
  emoji: string; label: string; onClick: () => void; disabled: boolean; accent?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-1 p-3 rounded-xl"
      style={{
        background: accent ? 'rgba(255,100,100,0.1)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${accent ? 'rgba(255,100,100,0.2)' : 'rgba(255,255,255,0.08)'}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
      }}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-[10px]" style={{ color: 'rgba(200,200,230,0.5)' }}>{label}</span>
    </motion.button>
  );
}
