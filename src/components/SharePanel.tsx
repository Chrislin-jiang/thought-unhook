/**
 * 分享功能 — Phase 3
 * - 今日解钩报告卡片
 * - 念头艺术画生成
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThoughtStore } from '../store';
import { generateShareInsight, generateShareInsightLLM, getThoughtArtPalette } from '../ai-service';
import { isLLMEnabled } from '../llm-client';
import { EMOTION_NAMES, PERSONA_INFO, RELEASE_METHOD_INFO } from '../types';
import type { EmotionType, PersonaType, ReleaseMethod } from '../types';

export default function SharePanel() {
  const showSharePanel = useThoughtStore(s => s.showSharePanel);
  const setShowSharePanel = useThoughtStore(s => s.setShowSharePanel);
  const [activeTab, setActiveTab] = useState<'report' | 'art'>('report');

  if (!showSharePanel) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}
        onClick={() => setShowSharePanel(false)}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(139,124,247,0.1)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Tab 切换 */}
          <div className="flex border-b" style={{ borderColor: 'rgba(139,124,247,0.08)' }}>
            <button
              onClick={() => setActiveTab('report')}
              className="flex-1 py-3 text-sm"
              style={{
                background: activeTab === 'report' ? 'rgba(139,124,247,0.06)' : 'transparent',
                color: activeTab === 'report' ? '#8B7CF7' : 'rgba(45,43,85,0.4)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                borderBottom: activeTab === 'report' ? '2px solid #8B7CF7' : '2px solid transparent',
              }}
            >
              📊 今日出戏报告
            </button>
            <button
              onClick={() => setActiveTab('art')}
              className="flex-1 py-3 text-sm"
              style={{
                background: activeTab === 'art' ? 'rgba(139,124,247,0.06)' : 'transparent',
                color: activeTab === 'art' ? '#8B7CF7' : 'rgba(45,43,85,0.4)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                borderBottom: activeTab === 'art' ? '2px solid #8B7CF7' : '2px solid transparent',
              }}
            >
              🎨 剧照生成
            </button>
          </div>

          {/* 内容区 */}
          <div className="p-4">
            {activeTab === 'report' ? <DailyReport /> : <ThoughtArtCard />}
          </div>

          {/* 关闭按钮 */}
          <div className="px-4 pb-4">
            <button
              onClick={() => setShowSharePanel(false)}
              className="w-full py-2.5 rounded-xl text-sm"
              style={{
                background: 'rgba(139,124,247,0.06)',
                border: '1px solid rgba(139,124,247,0.1)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              关闭
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ===== 今日解钩报告卡片 =====

function DailyReport() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thoughts = useThoughtStore(s => s.thoughts);
  const getTodayThoughts = useThoughtStore(s => s.getTodayThoughts);
  const getStreak = useThoughtStore(s => s.getStreak);
  const [saved, setSaved] = useState(false);

  const todayThoughts = getTodayThoughts();
  const totalToday = todayThoughts.length;
  const releasedToday = todayThoughts.filter(t => t.status === 'released').length;
  const streak = getStreak();

  // 今日情绪统计
  const emotionCounts: Record<string, number> = {};
  for (const t of todayThoughts) {
    emotionCounts[t.emotion] = (emotionCounts[t.emotion] || 0) + 1;
  }
  const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];

  // 今日角色
  const personaCounts: Record<string, number> = {};
  for (const t of todayThoughts) {
    personaCounts[t.persona] = (personaCounts[t.persona] || 0) + 1;
  }
  const topPersona = Object.entries(personaCounts).sort((a, b) => b[1] - a[1])[0];

  // 今日方法
  const methodCounts: Record<string, number> = {};
  for (const t of todayThoughts.filter(t => t.releaseMethod)) {
    if (t.releaseMethod) {
      methodCounts[t.releaseMethod] = (methodCounts[t.releaseMethod] || 0) + 1;
    }
  }
  const topMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0];

  // 分享洞察：LLM 优先，失败降级本地
  const [insight, setInsight] = useState('');

  useEffect(() => {
    let cancelled = false;
    const emotion = (topEmotion?.[0] as EmotionType) || 'neutral';
    const topP = topPersona?.[0] as PersonaType | undefined;

    if (isLLMEnabled() && totalToday > 0) {
      generateShareInsightLLM(totalToday, releasedToday, emotion, topP).then(result => {
        if (!cancelled) setInsight(result);
      }).catch(() => {
        if (!cancelled) setInsight(generateShareInsight(totalToday, releasedToday, emotion, topP));
      });
    } else {
      setInsight(generateShareInsight(totalToday, releasedToday, emotion, topP));
    }

    return () => { cancelled = true; };
  }, [totalToday, releasedToday, topEmotion?.[0], topPersona?.[0]]);

  const handleSaveImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 600;
    const h = 800;
    canvas.width = w;
    canvas.height = h;

    // 背景
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#0a0a2e');
    gradient.addColorStop(0.5, '#12123a');
    gradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // 星星装饰
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3 + 0.1})`;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 标题
    ctx.fillStyle = '#2D2B55';
    ctx.font = '24px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎭 今日出戏报告', w / 2, 80);

    // 日期
    ctx.fillStyle = 'rgba(45,43,85,0.4)';
    ctx.font = '14px "Noto Sans SC", sans-serif';
    ctx.fillText(new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }), w / 2, 115);

    // 数据卡片
    const drawCard = (x: number, y: number, label: string, value: string, emoji: string) => {
      ctx.fillStyle = 'rgba(139,124,247,0.04)';
      ctx.beginPath();
      ctx.roundRect(x, y, 160, 90, 12);
      ctx.fill();
      ctx.strokeStyle = 'rgba(139,124,247,0.08)';
      ctx.stroke();

      ctx.font = '28px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.textAlign = 'center';
      ctx.fillText(emoji, x + 80, y + 35);

      ctx.font = 'bold 20px "Noto Sans SC", sans-serif';
      ctx.fillStyle = '#2D2B55';
      ctx.fillText(value, x + 80, y + 62);

      ctx.font = '12px "Noto Sans SC", sans-serif';
      ctx.fillStyle = 'rgba(45,43,85,0.5)';
      ctx.fillText(label, x + 80, y + 82);
    };

    drawCard(40, 150, '记录场次', `${totalToday}`, '🎭');
    drawCard(220, 150, '已释放', `${releasedToday}`, '💨');
    drawCard(400, 150, '连续天数', `${streak}`, '🔥');

    // 洞察
    ctx.fillStyle = 'rgba(139,120,255,0.1)';
    ctx.beginPath();
    ctx.roundRect(40, 270, w - 80, 60, 12);
    ctx.fill();

    ctx.font = '14px "Noto Sans SC", sans-serif';
    ctx.fillStyle = 'rgba(45,43,85,0.8)';
    ctx.textAlign = 'center';
    ctx.fillText(insight, w / 2, 305);

    // 详细信息
    let infoY = 370;
    ctx.textAlign = 'left';

    if (topEmotion) {
      ctx.font = '14px "Noto Sans SC", sans-serif';
      ctx.fillStyle = 'rgba(200,200,230,0.6)';
      ctx.fillText(`主要情绪：${EMOTION_NAMES[topEmotion[0] as EmotionType] || topEmotion[0]}`, 60, infoY);
      infoY += 35;
    }

    if (topPersona) {
      const pInfo = PERSONA_INFO[topPersona[0] as PersonaType];
      if (pInfo) {
        ctx.fillText(`活跃角色：${pInfo.emoji} ${pInfo.name}（${topPersona[1]}次）`, 60, infoY);
        infoY += 35;
      }
    }

    if (topMethod) {
      const mInfo = RELEASE_METHOD_INFO[topMethod[0] as ReleaseMethod];
      if (mInfo) {
        ctx.fillText(`常用方法：${mInfo.emoji} ${mInfo.name}（${topMethod[1]}次）`, 60, infoY);
        infoY += 35;
      }
    }

    // 释放率环
    const releaseRate = totalToday > 0 ? releasedToday / totalToday : 0;
    const centerX = w / 2;
    const centerY = infoY + 80;
    const radius = 50;

    ctx.strokeStyle = 'rgba(139,124,247,0.06)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    if (releaseRate > 0) {
      const ringGrad = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
      ringGrad.addColorStop(0, 'rgba(139,120,255,0.8)');
      ringGrad.addColorStop(1, 'rgba(100,180,255,0.8)');
      ctx.strokeStyle = ringGrad;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * releaseRate);
      ctx.stroke();
    }

    ctx.font = 'bold 18px "Noto Sans SC", sans-serif';
    ctx.fillStyle = '#2D2B55';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(releaseRate * 100)}%`, centerX, centerY + 6);
    ctx.font = '11px "Noto Sans SC", sans-serif';
    ctx.fillStyle = 'rgba(45,43,85,0.4)';
    ctx.fillText('出戏率', centerX, centerY + 24);

    // 底部水印
    ctx.font = '12px "Noto Sans SC", sans-serif';
    ctx.fillStyle = 'rgba(200,200,230,0.2)';
    ctx.textAlign = 'center';
    ctx.fillText('出戏 · OffStage', w / 2, h - 30);

    // 下载
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `offstage-report-${new Date().toISOString().split('T')[0]}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }, [totalToday, releasedToday, streak, insight, thoughts]);

  return (
    <div>
      {/* 预览卡片 */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{
          background: 'linear-gradient(135deg, rgba(139,124,247,0.06), rgba(78,205,196,0.04))',
          border: '1px solid rgba(139,124,247,0.12)',
        }}
      >
        <div className="text-center mb-4">
          <p className="text-lg font-medium" style={{ color: '#2D2B55' }}>
            🎭 今日出戏报告
          </p>
          <p className="text-[10px] mt-1" style={{ color: 'rgba(45,43,85,0.4)' }}>
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <MiniStat emoji="🎭" value={totalToday} label="场戏" />
          <MiniStat emoji="💨" value={releasedToday} label="散场" />
          <MiniStat emoji="🔥" value={streak} label="连续" />
        </div>

        <div className="p-2 rounded-lg mb-3" style={{
          background: 'rgba(139,120,255,0.08)',
          border: '1px solid rgba(139,120,255,0.1)',
        }}>
          <p className="text-xs text-center" style={{ color: 'rgba(45,43,85,0.65)' }}>
            {insight}
          </p>
        </div>

        {totalToday > 0 && (
          <div className="space-y-1.5 text-[11px]" style={{ color: 'rgba(45,43,85,0.5)' }}>
            {topEmotion && (
              <p>主要情绪：{EMOTION_NAMES[topEmotion[0] as EmotionType]}</p>
            )}
            {topPersona && (
              <p>活跃角色：{PERSONA_INFO[topPersona[0] as PersonaType]?.emoji} {PERSONA_INFO[topPersona[0] as PersonaType]?.name}</p>
            )}
            {topMethod && (
              <p>常用方法：{RELEASE_METHOD_INFO[topMethod[0] as ReleaseMethod]?.emoji} {RELEASE_METHOD_INFO[topMethod[0] as ReleaseMethod]?.name}</p>
            )}
          </div>
        )}
      </div>

      {/* 保存按钮 */}
      <motion.button
        onClick={handleSaveImage}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-2.5 rounded-xl text-sm font-medium"
        style={{
          background: saved
            ? 'rgba(139,220,180,0.2)'
            : 'linear-gradient(135deg, rgba(139,120,255,0.3), rgba(100,180,255,0.3))',
          border: '1px solid rgba(139,120,255,0.2)',
          color: saved ? 'rgba(139,220,180,0.9)' : '#2D2B55',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {saved ? '✅ 已保存到相册' : '💾 保存为图片'}
      </motion.button>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

// ===== 念头艺术画生成 =====

function ThoughtArtCard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const thoughts = useThoughtStore(s => s.thoughts);
  const activeThoughts = thoughts.filter(t => t.status === 'active');
  const [selectedThought, setSelectedThought] = useState(activeThoughts[0] || thoughts[0]);
  const [saved, setSaved] = useState(false);

  const handleGenerate = useCallback(() => {
    if (!selectedThought || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 600;
    const h = 600;
    canvas.width = w;
    canvas.height = h;

    const palette = getThoughtArtPalette(selectedThought.emotion);

    // 渐变背景
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
    bgGrad.addColorStop(0, palette.colors[3] || '#0a0a1a');
    bgGrad.addColorStop(1, '#000');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 抽象形状
    const shapeCount = 12 + Math.floor(selectedThought.intensity * 2);
    for (let i = 0; i < shapeCount; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const size = Math.random() * 100 + 30;
      const colorIdx = i % palette.colors.length;
      const alpha = Math.random() * 0.3 + 0.05;

      ctx.fillStyle = palette.colors[colorIdx] + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();

      // 随机形状类型
      const shapeType = i % 3;
      if (shapeType === 0) {
        // 圆形
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (shapeType === 1) {
        // 椭圆
        ctx.ellipse(x, y, size * 0.7, size * 0.4, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // 模糊圆
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, palette.colors[colorIdx] + '40');
        gradient.addColorStop(1, palette.colors[colorIdx] + '00');
        ctx.fillStyle = gradient;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 流线
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = palette.colors[i % palette.colors.length] + '30';
      ctx.lineWidth = Math.random() * 3 + 0.5;
      ctx.beginPath();
      const startX = Math.random() * w;
      const startY = Math.random() * h;
      ctx.moveTo(startX, startY);
      for (let j = 0; j < 5; j++) {
        ctx.quadraticCurveTo(
          Math.random() * w, Math.random() * h,
          Math.random() * w, Math.random() * h,
        );
      }
      ctx.stroke();
    }

    // 念头文字
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '18px "Noto Sans SC", sans-serif';
    ctx.textAlign = 'center';

    // 自动换行
    const maxWidth = w - 100;
    const content = selectedThought.content;
    const words = content.split('');
    let line = '';
    const lines: string[] = [];

    for (const char of words) {
      const testLine = line + char;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(line);
        line = char;
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    const lineHeight = 28;
    const textStartY = h / 2 - (lines.length * lineHeight) / 2;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], w / 2, textStartY + i * lineHeight);
    }

    // 风格标签
    ctx.fillStyle = 'rgba(45,43,85,0.3)';
    ctx.font = '12px "Noto Sans SC", sans-serif';
    ctx.fillText(`「${palette.style}」`, w / 2, h - 50);

    // 水印
    ctx.fillStyle = 'rgba(200,200,230,0.15)';
    ctx.font = '10px "Noto Sans SC", sans-serif';
    ctx.fillText('出戏 · OffStage', w / 2, h - 25);

    // 下载
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `offstage-art-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }, [selectedThought]);

  if (thoughts.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="text-3xl block mb-2">🎨</span>
        <p className="text-sm" style={{ color: 'rgba(45,43,85,0.5)' }}>
          还没有台词可以变成剧照
        </p>
      </div>
    );
  }

  const palette = selectedThought ? getThoughtArtPalette(selectedThought.emotion) : null;

  return (
    <div>
      {/* 念头选择 */}
      <p className="text-[10px] mb-2" style={{ color: 'rgba(45,43,85,0.4)' }}>
        选择一句台词生成剧照
      </p>
      <div className="space-y-1.5 max-h-32 overflow-y-auto mb-4">
        {thoughts.slice(0, 10).map(t => (
          <button
            key={t.uid}
            onClick={() => setSelectedThought(t)}
            className="w-full text-left p-2 rounded-lg text-xs truncate"
            style={{
              background: selectedThought?.uid === t.uid ? 'rgba(139,120,255,0.12)' : 'rgba(139,124,247,0.03)',
              border: `1px solid ${selectedThought?.uid === t.uid ? 'rgba(139,120,255,0.2)' : 'rgba(139,124,247,0.04)'}`,
              color: 'rgba(45,43,85,0.65)',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {t.content}
          </button>
        ))}
      </div>

      {/* 艺术风格预览 */}
      {selectedThought && palette && (
        <div className="rounded-xl p-4 mb-4 text-center" style={{
          background: `linear-gradient(135deg, ${palette.colors[3]}cc, ${palette.colors[0]}33)`,
          border: '1px solid rgba(139,124,247,0.08)',
        }}>
          <div className="flex justify-center gap-2 mb-3">
            {palette.colors.map((c, i) => (
              <div key={i} className="w-6 h-6 rounded-full" style={{ background: c, opacity: 0.8 }} />
            ))}
          </div>
          <p className="text-xs" style={{ color: 'rgba(45,43,85,0.65)' }}>
            风格：{palette.style}
          </p>
          <p className="text-[10px] mt-1 truncate px-4" style={{ color: 'rgba(45,43,85,0.4)' }}>
            「{selectedThought.content}」
          </p>
        </div>
      )}

      {/* 生成按钮 */}
      <motion.button
        onClick={handleGenerate}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-2.5 rounded-xl text-sm font-medium"
        style={{
          background: saved
            ? 'rgba(139,220,180,0.2)'
            : 'linear-gradient(135deg, rgba(139,120,255,0.3), rgba(100,180,255,0.3))',
          border: '1px solid rgba(139,120,255,0.2)',
          color: saved ? 'rgba(139,220,180,0.9)' : '#2D2B55',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        {saved ? '✅ 已保存' : '🎨 生成并保存剧照'}
      </motion.button>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

// ===== 子组件 =====

function MiniStat({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <div className="text-center p-2 rounded-lg" style={{
      background: 'rgba(139,124,247,0.03)',
      border: '1px solid rgba(139,124,247,0.04)',
    }}>
      <span className="text-sm">{emoji}</span>
      <p className="text-lg font-medium" style={{ color: '#2D2B55' }}>{value}</p>
      <p className="text-[9px]" style={{ color: 'rgba(45,43,85,0.4)' }}>{label}</p>
    </div>
  );
}
