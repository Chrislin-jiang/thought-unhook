/**
 * 解钩操作面板 — 选中气泡后展开
 * 三种操作：✏️ 改写 / 🎵 变声 / 💨 吹走
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThoughtStore } from '../store';
import { speakThought, FUNNY_VOICES } from '../ai-service';
import type { VoiceOption } from '../ai-service';
import { PERSONA_INFO, DISTORTION_NAMES } from '../types';

export default function ActionPanel() {
  const selectedId = useThoughtStore(s => s.selectedThoughtId);
  const thoughts = useThoughtStore(s => s.thoughts);
  const releaseThought = useThoughtStore(s => s.releaseThought);
  const setRewritten = useThoughtStore(s => s.setRewritten);
  const requestRewrite = useThoughtStore(s => s.requestRewrite);
  const clearRewrite = useThoughtStore(s => s.clearRewrite);
  const selectThought = useThoughtStore(s => s.selectThought);
  const isRewriting = useThoughtStore(s => s.isRewriting);
  const rewriteVariants = useThoughtStore(s => s.rewriteVariants);

  const [showVoices, setShowVoices] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [releasingId, setReleasingId] = useState<string | null>(null);

  const thought = thoughts.find(t => t.id === selectedId && t.status === 'active');

  if (!thought) return null;

  const persona = PERSONA_INFO[thought.persona];
  const distortionName = DISTORTION_NAMES[thought.cognitiveDistortion];

  // ===== 改写操作 =====
  const handleRewrite = () => {
    setShowVoices(false);
    requestRewrite(thought.id);
  };

  const handleSelectRewrite = (text: string) => {
    setRewritten(thought.id, text);
    clearRewrite();
  };

  // ===== 变声操作 =====
  const handleVoice = () => {
    clearRewrite();
    setShowVoices(!showVoices);
  };

  const handleSpeak = async (voice: VoiceOption) => {
    setIsSpeaking(true);
    try {
      await speakThought(thought.content, voice);
    } catch {
      // ignore
    }
    setIsSpeaking(false);
  };

  // ===== 吹走操作 =====
  const handleBlow = () => {
    setReleasingId(thought.id);
    setShowVoices(false);
    clearRewrite();

    // 延迟执行释放，让动画先跑
    setTimeout(() => {
      releaseThought(thought.id, 'blow');
      setReleasingId(null);
      selectThought(null);
    }, 700);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="action-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md mx-auto"
      >
        {/* 念头信息头 */}
        <div className="text-center mb-3">
          <span className="text-sm" style={{ color: 'rgba(200,200,230,0.5)' }}>
            {persona.emoji} {persona.name} · {distortionName}
          </span>
        </div>

        {/* 三个操作按钮 */}
        <div className="flex gap-3 justify-center mb-4">
          {/* ✏️ 改写 */}
          <motion.button
            className="action-btn"
            onClick={handleRewrite}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              borderColor: rewriteVariants ? 'rgba(139,220,180,0.3)' : undefined,
              background: rewriteVariants ? 'rgba(139,220,180,0.08)' : undefined,
            }}
          >
            <span className="icon">✏️</span>
            <span>改写</span>
          </motion.button>

          {/* 🎵 变声 */}
          <motion.button
            className="action-btn"
            onClick={handleVoice}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSpeaking}
            style={{
              borderColor: showVoices ? 'rgba(255,200,100,0.3)' : undefined,
              background: showVoices ? 'rgba(255,200,100,0.08)' : undefined,
            }}
          >
            <span className="icon">{isSpeaking ? '🔊' : '🎵'}</span>
            <span>{isSpeaking ? '播放中...' : '搞笑变声'}</span>
          </motion.button>

          {/* 💨 吹走 */}
          <motion.button
            className="action-btn"
            onClick={handleBlow}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!!releasingId}
            style={{
              borderColor: releasingId ? 'rgba(100,180,255,0.3)' : undefined,
              background: releasingId ? 'rgba(100,180,255,0.08)' : undefined,
            }}
          >
            <span className="icon">💨</span>
            <span>{releasingId ? '飘走了...' : '吹走'}</span>
          </motion.button>
        </div>

        {/* 改写结果面板 */}
        <AnimatePresence>
          {isRewriting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rewrite-panel p-4 mb-3"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="text-lg"
                >
                  ✨
                </motion.div>
                <span className="text-sm" style={{ color: 'rgba(200,200,230,0.6)' }}>
                  AI 正在思考另一种说法...
                </span>
              </div>
            </motion.div>
          )}

          {rewriteVariants && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rewrite-panel p-4 mb-3"
            >
              <p className="text-xs mb-3" style={{ color: 'rgba(200,200,230,0.4)' }}>
                换一种说法，感觉可能不一样了 ✏️
              </p>
              <div className="space-y-2">
                {rewriteVariants.map((variant, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    onClick={() => handleSelectRewrite(variant.text)}
                    className="w-full text-left p-3 rounded-xl transition-all hover:bg-white/[0.06]"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <span
                      className="text-[10px] block mb-1"
                      style={{ color: 'rgba(139,220,180,0.5)' }}
                    >
                      {variant.techniqueName}
                    </span>
                    <span className="text-sm" style={{ color: 'rgba(200,230,200,0.85)' }}>
                      {variant.text}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 变声选择面板 */}
        <AnimatePresence>
          {showVoices && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rewrite-panel p-4 mb-3"
            >
              <p className="text-xs mb-3" style={{ color: 'rgba(200,200,230,0.4)' }}>
                用搞笑的声音读一遍，念头就没那么可怕了 🎵
              </p>
              <div className="grid grid-cols-2 gap-2">
                {FUNNY_VOICES.map(voice => (
                  <motion.button
                    key={voice.id}
                    onClick={() => handleSpeak(voice)}
                    disabled={isSpeaking}
                    className="flex items-center gap-2 p-3 rounded-xl transition-all hover:bg-white/[0.06]"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      cursor: isSpeaking ? 'not-allowed' : 'pointer',
                    }}
                    whileHover={isSpeaking ? {} : { scale: 1.02 }}
                    whileTap={isSpeaking ? {} : { scale: 0.95 }}
                  >
                    <span className="text-xl">{voice.emoji}</span>
                    <span className="text-sm" style={{ color: 'rgba(230,230,250,0.7)' }}>
                      {voice.name}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 引导语 */}
        <div className="text-center">
          <p className="text-xs" style={{ color: 'rgba(200,200,230,0.25)' }}>
            不是反驳它，而是让它"变轻"
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
