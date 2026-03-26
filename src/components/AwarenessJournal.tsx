/**
 * 觉察日志 — Phase 1 基础版
 * 
 * 功能：
 * - 时间线视图（最近7天）
 * - 念头计数统计
 * - 情绪分布
 * - 解钩方式统计
 * - 温柔洞察
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useThoughtStore } from '../store';
import { EMOTION_NAMES, EMOTION_COLORS, PERSONA_INFO, DISTORTION_NAMES } from '../types';
import type { EmotionType, PersonaType, CognitiveDistortion } from '../types';

export default function AwarenessJournal() {
  const thoughts = useThoughtStore(s => s.thoughts);
  const getDailyStats = useThoughtStore(s => s.getDailyStats);
  const stats = useMemo(() => getDailyStats(7), [getDailyStats, thoughts]);

  const totalThoughts = thoughts.length;
  const releasedThoughts = thoughts.filter(t => t.status === 'released');
  const releaseRate = totalThoughts > 0 ? Math.round((releasedThoughts.length / totalThoughts) * 100) : 0;

  // 情绪分布
  const emotionDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const t of thoughts) {
      dist[t.emotion] = (dist[t.emotion] || 0) + 1;
    }
    return Object.entries(dist)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [thoughts]);

  // 角色出场
  const personaDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const t of thoughts) {
      dist[t.persona] = (dist[t.persona] || 0) + 1;
    }
    return Object.entries(dist)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [thoughts]);

  // 认知扭曲分布
  const distortionDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const t of thoughts) {
      if (t.cognitiveDistortion !== 'unknown') {
        dist[t.cognitiveDistortion] = (dist[t.cognitiveDistortion] || 0) + 1;
      }
    }
    return Object.entries(dist)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [thoughts]);

  // 温柔洞察
  const insight = useMemo(() => generateInsight(thoughts), [thoughts]);

  if (totalThoughts === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <span className="text-4xl block mb-4">📊</span>
          <p className="text-sm" style={{ color: 'rgba(200,200,230,0.5)' }}>
            还没有觉察记录
          </p>
          <p className="text-xs mt-2" style={{ color: 'rgba(200,200,230,0.3)' }}>
            去「念头空间」捕捉一些念头吧
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 relative z-10">
      {/* 温柔洞察卡片 */}
      {insight && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(139,120,255,0.08), rgba(100,180,255,0.05))',
            border: '1px solid rgba(139,120,255,0.15)',
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(200,200,230,0.8)' }}>
            {insight}
          </p>
        </motion.div>
      )}

      {/* 总览数据 */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="总念头数" value={totalThoughts} emoji="🫧" />
        <StatCard label="已释放" value={releasedThoughts.length} emoji="💨" />
        <StatCard label="释放率" value={`${releaseRate}%`} emoji="📈" />
      </div>

      {/* 7天时间线 */}
      <Section title="📅 最近7天">
        <div className="flex items-end justify-between gap-2 h-24">
          {[...stats].reverse().map((day, i) => {
            const maxCount = Math.max(...stats.map(d => d.thoughtCount), 1);
            const height = day.thoughtCount > 0 ? Math.max(12, (day.thoughtCount / maxCount) * 80) : 4;
            const dayLabel = new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short' });
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px]" style={{ color: 'rgba(200,200,230,0.4)' }}>
                  {day.thoughtCount || ''}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height }}
                  transition={{ delay: i * 0.1 }}
                  className="w-full rounded-t-lg"
                  style={{
                    background: day.thoughtCount > 0
                      ? 'linear-gradient(to top, rgba(139,120,255,0.4), rgba(100,180,255,0.3))'
                      : 'rgba(255,255,255,0.05)',
                    minHeight: '4px',
                  }}
                />
                <span className="text-[9px]" style={{ color: 'rgba(200,200,230,0.3)' }}>
                  {dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* 情绪分布 */}
      {emotionDistribution.length > 0 && (
        <Section title="🎨 情绪分布">
          <div className="space-y-2">
            {emotionDistribution.map(([emotion, count]) => {
              const colors = EMOTION_COLORS[emotion as EmotionType];
              const name = EMOTION_NAMES[emotion as EmotionType];
              const pct = Math.round((count / totalThoughts) * 100);
              return (
                <div key={emotion} className="flex items-center gap-3">
                  <span className="text-xs w-12" style={{ color: colors.text }}>{name}</span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: colors.glow }}
                    />
                  </div>
                  <span className="text-xs w-8 text-right" style={{ color: 'rgba(200,200,230,0.4)' }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* 角色出场 */}
      {personaDistribution.length > 0 && (
        <Section title="👥 脑内角色">
          <div className="grid grid-cols-2 gap-3">
            {personaDistribution.map(([persona, count]) => {
              const info = PERSONA_INFO[persona as PersonaType];
              return (
                <div
                  key={persona}
                  className="flex items-center gap-2 p-3 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span className="text-xl">{info.emoji}</span>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'rgba(230,230,250,0.7)' }}>
                      {info.shortName}
                    </p>
                    <p className="text-[10px]" style={{ color: 'rgba(200,200,230,0.4)' }}>
                      {count} 次出场
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* 认知扭曲 */}
      {distortionDistribution.length > 0 && (
        <Section title="🧠 思维模式">
          <div className="space-y-2">
            {distortionDistribution.map(([dist, count]) => {
              const name = DISTORTION_NAMES[dist as CognitiveDistortion];
              const pct = Math.round((count / totalThoughts) * 100);
              return (
                <div key={dist} className="flex items-center gap-3">
                  <span className="text-xs w-20 truncate" style={{ color: 'rgba(200,200,230,0.5)' }}>
                    {name}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ background: 'rgba(255,200,100,0.4)' }}
                    />
                  </div>
                  <span className="text-[10px] w-8 text-right" style={{ color: 'rgba(200,200,230,0.3)' }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* 底部留白 */}
      <div className="h-4" />
    </div>
  );
}

// ===== 子组件 =====

function StatCard({ label, value, emoji }: { label: string; value: number | string; emoji: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-3 rounded-xl text-center"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span className="text-lg block mb-1">{emoji}</span>
      <span className="text-xl font-medium block" style={{ color: 'rgba(230,230,250,0.9)' }}>
        {value}
      </span>
      <span className="text-[10px]" style={{ color: 'rgba(200,200,230,0.4)' }}>
        {label}
      </span>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-medium mb-3" style={{ color: 'rgba(200,200,230,0.5)' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ===== 温柔洞察生成 =====

function generateInsight(thoughts: Array<{ status: string; emotion: string; persona: string; releaseMethod?: string }>): string | null {
  if (thoughts.length === 0) return null;

  const released = thoughts.filter(t => t.status === 'released');
  const releaseRate = released.length / thoughts.length;

  // 最常见的角色
  const personaCounts: Record<string, number> = {};
  for (const t of thoughts) {
    personaCounts[t.persona] = (personaCounts[t.persona] || 0) + 1;
  }
  const topPersona = Object.entries(personaCounts).sort((a, b) => b[1] - a[1])[0];
  const topPersonaInfo = topPersona ? PERSONA_INFO[topPersona[0] as PersonaType] : null;

  // 最常用的解钩方式
  const methodCounts: Record<string, number> = {};
  for (const t of released) {
    if (t.releaseMethod) {
      methodCounts[t.releaseMethod] = (methodCounts[t.releaseMethod] || 0) + 1;
    }
  }
  const topMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0];

  const insights: string[] = [];

  if (thoughts.length >= 3 && releaseRate >= 0.5) {
    insights.push(`你已经解钩了 ${released.length} 个念头，做得很好 ✨`);
  }
  if (thoughts.length >= 5 && releaseRate < 0.3) {
    insights.push(`你捕捉了很多念头，试试选择一些释放掉？不需要抓住每一个 🍃`);
  }
  if (topPersonaInfo && topPersona[1] >= 3) {
    insights.push(`${topPersonaInfo.emoji}「${topPersonaInfo.name}」是你最常听到的声音（${topPersona[1]}次），下次它说话时，跟它打个招呼 👋`);
  }
  if (topMethod) {
    const methodNames: Record<string, string> = {
      blow: '吹走', melt: '融化', rewrite: '改写', voice: '变声',
      resize: '缩小', observe: '看见', label: '贴标签', store: '暂存',
    };
    insights.push(`你最擅长的解钩方式是「${methodNames[topMethod[0]] || topMethod[0]}」，试试其他方式可能有新感受 🌱`);
  }

  if (insights.length === 0) {
    insights.push('每一次写下念头，都是一次对自己的觉察 🌿');
  }

  return insights[Math.floor(Math.random() * insights.length)];
}
