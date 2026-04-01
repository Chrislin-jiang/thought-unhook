/**
 * 觉察日志 — 柔和治愈风
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useThoughtStore } from '../store';
import { EMOTION_NAMES, EMOTION_COLORS, PERSONA_INFO, DISTORTION_NAMES } from '../types';
import type { EmotionType, PersonaType, CognitiveDistortion } from '../types';
import PersonaCard from './PersonaCard';

export default function AwarenessJournal() {
  const thoughts = useThoughtStore(s => s.thoughts);
  const getDailyStats = useThoughtStore(s => s.getDailyStats);
  const getWordCloud = useThoughtStore(s => s.getWordCloud);
  const stats = useMemo(() => getDailyStats(7), [getDailyStats, thoughts]);
  const [expandedPersona, setExpandedPersona] = useState<PersonaType | null>(null);

  const totalThoughts = thoughts.length;
  const releasedThoughts = thoughts.filter(t => t.status === 'released');
  const releaseRate = totalThoughts > 0 ? Math.round((releasedThoughts.length / totalThoughts) * 100) : 0;

  const emotionDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const t of thoughts) dist[t.emotion] = (dist[t.emotion] || 0) + 1;
    return Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [thoughts]);

  const personaDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const t of thoughts) dist[t.persona] = (dist[t.persona] || 0) + 1;
    return Object.entries(dist).sort((a, b) => b[1] - a[1]);
  }, [thoughts]);

  const distortionDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const t of thoughts) {
      if (t.cognitiveDistortion !== 'unknown') dist[t.cognitiveDistortion] = (dist[t.cognitiveDistortion] || 0) + 1;
    }
    return Object.entries(dist).sort((a, b) => b[1] - a[1]);
  }, [thoughts]);

  const wordCloud = useMemo(() => getWordCloud(), [getWordCloud, thoughts]);
  const insight = useMemo(() => generateInsight(thoughts), [thoughts]);

  if (totalThoughts === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <span className="text-5xl block mb-4">📊</span>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>还没有演出记录</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>去「内心剧场」记录一些台词吧</p>
        </div>
      </div>
    );
  }

  const totalDistortions = distortionDistribution.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 relative z-10">
      {/* 洞察卡片 */}
      {insight && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4">
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{insight}</p>
        </motion.div>
      )}

      {/* 总览 */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="总场次" value={totalThoughts} emoji="🎭" />
        <StatCard label="已散场" value={releasedThoughts.length} emoji="💨" />
        <StatCard label="出戏率" value={`${releaseRate}%`} emoji="📈" />
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
                <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{day.thoughtCount || ''}</span>
                <motion.div initial={{ height: 0 }} animate={{ height }} transition={{ delay: i * 0.1 }}
                  className="w-full rounded-t-xl"
                  style={{ background: day.thoughtCount > 0
                    ? 'linear-gradient(to top, rgba(139,124,247,0.5), rgba(167,139,250,0.3))'
                    : 'rgba(139,124,247,0.06)', minHeight: '4px' }} />
                <span className="text-[9px]" style={{ color: 'var(--text-hint)' }}>{dayLabel}</span>
              </div>
            );
          })}
        </div>
      </Section>

      {/* 认知扭曲分布 */}
      {distortionDistribution.length > 0 && (
        <Section title="🧠 思维模式">
          <div className="flex items-center gap-4 mb-3">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {(() => {
                  let accumulated = 0;
                  const pieColors = ['#8B7CF7', '#4ECDC4', '#FFB36B', '#FF8FAB', '#7EB6FF', '#C5A3D9', '#FFB5B5', '#A8D8E8'];
                  return distortionDistribution.map(([, count], i) => {
                    const pct = (count / totalDistortions) * 100;
                    const offset = accumulated;
                    accumulated += pct;
                    return (<circle key={i} cx="50" cy="50" r="40" fill="none" stroke={pieColors[i % pieColors.length]}
                      strokeWidth="18" strokeDasharray={`${pct * 2.51} ${251.2 - pct * 2.51}`}
                      strokeDashoffset={`${-offset * 2.51}`} opacity="0.7" />);
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{totalDistortions}</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {distortionDistribution.slice(0, 5).map(([dist, count], i) => {
                const pieColors = ['#8B7CF7', '#4ECDC4', '#FFB36B', '#FF8FAB', '#7EB6FF'];
                const name = DISTORTION_NAMES[dist as CognitiveDistortion];
                const pct = Math.round((count / totalDistortions) * 100);
                return (
                  <div key={dist} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: pieColors[i] }} />
                    <span className="text-[11px] flex-1 truncate" style={{ color: 'var(--text-secondary)' }}>{name}</span>
                    <span className="text-[11px] font-medium" style={{ color: 'var(--text-tertiary)' }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>
      )}

      {/* 角色出场 */}
      {personaDistribution.length > 0 && (
        <Section title="👥 剧团成员">
          <div className="space-y-2">
            {personaDistribution.map(([persona, count]) => {
              const pct = Math.round((count / totalThoughts) * 100);
              return (<PersonaCard key={persona} persona={persona as PersonaType} count={count}
                percentage={pct} expanded={expandedPersona === persona}
                onClick={() => setExpandedPersona(expandedPersona === persona ? null : persona as PersonaType)} />);
            })}
          </div>
        </Section>
      )}

      {/* 情绪分布 */}
      {emotionDistribution.length > 0 && (
        <Section title="🎨 情绪色彩">
          <div className="space-y-2.5">
            {emotionDistribution.map(([emotion, count]) => {
              const colors = EMOTION_COLORS[emotion as EmotionType];
              const name = EMOTION_NAMES[emotion as EmotionType];
              const pct = Math.round((count / totalThoughts) * 100);
              return (
                <div key={emotion} className="flex items-center gap-3">
                  <span className="text-xs w-10 font-medium" style={{ color: colors.text }}>{name}</span>
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(139,124,247,0.06)' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }} className="h-full rounded-full" style={{ background: colors.text, opacity: 0.6 }} />
                  </div>
                  <span className="text-xs w-8 text-right" style={{ color: 'var(--text-tertiary)' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* 词云 */}
      {wordCloud.length > 0 && (
        <Section title="☁️ 念头词云">
          <div className="flex flex-wrap gap-2 justify-center p-4 glass-card">
            {wordCloud.slice(0, 20).map((item, i) => {
              const maxCount = wordCloud[0]?.count || 1;
              const scale = 0.7 + (item.count / maxCount) * 0.8;
              const opacity = 0.4 + (item.count / maxCount) * 0.6;
              const colors = ['#8B7CF7', '#4ECDC4', '#FFB36B', '#FF8FAB', '#7EB6FF', '#C5A3D9'];
              return (
                <motion.span key={item.word} initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  className="px-2.5 py-1 rounded-full"
                  style={{
                    fontSize: `${Math.max(11, scale * 14)}px`,
                    color: colors[i % colors.length],
                    background: colors[i % colors.length] + '15',
                    fontWeight: 500,
                  }}>
                  {item.word}{item.count > 1 && <sup className="text-[8px] ml-0.5" style={{ opacity: 0.5 }}>{item.count}</sup>}
                </motion.span>
              );
            })}
          </div>
        </Section>
      )}

      <div className="h-4" />
    </div>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: number | string; emoji: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-3 text-center">
      <span className="text-lg block mb-1">{emoji}</span>
      <span className="text-xl font-semibold block" style={{ color: '#2D2B55' }}>{value}</span>
      <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>{title}</h3>
      {children}
    </div>
  );
}

function generateInsight(thoughts: Array<{ status: string; emotion: string; persona: string; releaseMethod?: string; cognitiveDistortion?: string }>): string | null {
  if (thoughts.length === 0) return null;
  const released = thoughts.filter(t => t.status === 'released');
  const releaseRate = released.length / thoughts.length;
  const personaCounts: Record<string, number> = {};
  for (const t of thoughts) personaCounts[t.persona] = (personaCounts[t.persona] || 0) + 1;
  const topPersona = Object.entries(personaCounts).sort((a, b) => b[1] - a[1])[0];
  const topPersonaInfo = topPersona ? PERSONA_INFO[topPersona[0] as PersonaType] : null;
  const methodCounts: Record<string, number> = {};
  for (const t of released) { if (t.releaseMethod) methodCounts[t.releaseMethod] = (methodCounts[t.releaseMethod] || 0) + 1; }
  const topMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0];
  const distortionCounts: Record<string, number> = {};
  for (const t of thoughts) { if (t.cognitiveDistortion && t.cognitiveDistortion !== 'unknown') distortionCounts[t.cognitiveDistortion] = (distortionCounts[t.cognitiveDistortion] || 0) + 1; }
  const topDistortion = Object.entries(distortionCounts).sort((a, b) => b[1] - a[1])[0];
  const insights: string[] = [];
  if (thoughts.length >= 3 && releaseRate >= 0.5) insights.push(`你已经从 ${released.length} 场戏里出来了，做得很好 ✨`);
  if (thoughts.length >= 5 && releaseRate < 0.3) insights.push(`你记录了很多台词，试试让一些戏散场？不需要每出戏都入戏 🍃`);
  if (topPersonaInfo && topPersona[1] >= 3) insights.push(`${topPersonaInfo.emoji}「${topPersonaInfo.name}」是你剧团里最活跃的演员（${topPersona[1]}次），下次它登台时，跟它打个招呼 👋`);
  if (topMethod) {
    const methodNames: Record<string, string> = { blow: '吹走', melt: '融化', rewrite: '改写', voice: '变声', resize: '缩小', observe: '看见', label: '贴标签', store: '暂存' };
    insights.push(`你最擅长的出戏方式是「${methodNames[topMethod[0]] || topMethod[0]}」🌱`);
  }
  if (topDistortion && topDistortion[1] >= 2) {
    const distortionName = DISTORTION_NAMES[topDistortion[0] as CognitiveDistortion];
    insights.push(`你的大脑最爱使用「${distortionName}」模式。认识到这一点就是觉察的开始 🔍`);
  }
  if (thoughts.length >= 10) insights.push(`你已经记录了 ${thoughts.length} 场戏。每一次写下来，都是一次走到台下 🌿`);
  if (insights.length === 0) insights.push('每一次记录台词，都是一次成功的出戏 🌿');
  return insights[Math.floor(Math.random() * insights.length)];
}
