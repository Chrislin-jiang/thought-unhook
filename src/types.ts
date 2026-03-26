// ===== Phase 0 核心类型 =====

export type EmotionType =
  | 'anxiety'
  | 'anger'
  | 'sadness'
  | 'fear'
  | 'guilt'
  | 'shame'
  | 'neutral'
  | 'mixed';

export type CognitiveDistortion =
  | 'catastrophizing'
  | 'overgeneralization'
  | 'mind-reading'
  | 'should-statements'
  | 'personalization'
  | 'black-white'
  | 'emotional-reasoning'
  | 'fortune-telling'
  | 'labeling'
  | 'discounting-positive'
  | 'unknown';

export type PersonaType =
  | 'anxiety-monster'
  | 'perfectionist-ai'
  | 'inner-child'
  | 'performer'
  | 'judge'
  | 'fortune-teller';

export type ReleaseMethod =
  | 'rewrite'
  | 'voice'
  | 'blow';

export interface Thought {
  id: string;
  content: string;
  rewrittenContent?: string;
  createdAt: number;
  emotion: EmotionType;
  intensity: number;
  cognitiveDistortion: CognitiveDistortion;
  persona: PersonaType;
  status: 'active' | 'stored' | 'released';
  releasedAt?: number;
  releaseMethod?: ReleaseMethod;
}

// 气泡的情绪颜色映射
export const EMOTION_COLORS: Record<EmotionType, { bg: string; glow: string; text: string }> = {
  anxiety:  { bg: 'rgba(255, 107, 107, 0.15)', glow: 'rgba(255, 107, 107, 0.3)',  text: '#ff9b9b' },
  anger:    { bg: 'rgba(255, 71, 87, 0.15)',   glow: 'rgba(255, 71, 87, 0.3)',    text: '#ff7b87' },
  sadness:  { bg: 'rgba(95, 158, 200, 0.15)',  glow: 'rgba(95, 158, 200, 0.3)',   text: '#8fcef0' },
  fear:     { bg: 'rgba(221, 160, 221, 0.15)', glow: 'rgba(221, 160, 221, 0.3)',  text: '#edc0ed' },
  guilt:    { bg: 'rgba(205, 133, 63, 0.15)',  glow: 'rgba(205, 133, 63, 0.3)',   text: '#dda573' },
  shame:    { bg: 'rgba(188, 143, 143, 0.15)', glow: 'rgba(188, 143, 143, 0.3)',  text: '#ccafaf' },
  neutral:  { bg: 'rgba(135, 206, 235, 0.12)', glow: 'rgba(135, 206, 235, 0.25)', text: '#a7d6eb' },
  mixed:    { bg: 'rgba(177, 156, 217, 0.15)', glow: 'rgba(177, 156, 217, 0.3)',  text: '#c1acf7' },
};

// 认知扭曲中文名
export const DISTORTION_NAMES: Record<CognitiveDistortion, string> = {
  'catastrophizing':      '灾难化思维',
  'overgeneralization':   '过度概括',
  'mind-reading':         '读心术',
  'should-statements':    '应该思维',
  'personalization':      '个人化',
  'black-white':          '非黑即白',
  'emotional-reasoning':  '情绪推理',
  'fortune-telling':      '预言未来',
  'labeling':             '贴标签',
  'discounting-positive': '否定正面',
  'unknown':              '自动念头',
};

// 内在角色信息
export const PERSONA_INFO: Record<PersonaType, { emoji: string; name: string; shortName: string }> = {
  'anxiety-monster':  { emoji: '👿', name: '焦虑怪', shortName: '焦虑怪' },
  'perfectionist-ai': { emoji: '🤖', name: '完美主义AI', shortName: '完美主义' },
  'inner-child':      { emoji: '👶', name: '内在小孩', shortName: '内在小孩' },
  'performer':        { emoji: '🎭', name: '表演者', shortName: '表演者' },
  'judge':            { emoji: '📢', name: '评判官', shortName: '评判官' },
  'fortune-teller':   { emoji: '🔮', name: '预言家', shortName: '预言家' },
};

// 情绪中文名
export const EMOTION_NAMES: Record<EmotionType, string> = {
  anxiety: '焦虑',
  anger: '愤怒',
  sadness: '悲伤',
  fear: '恐惧',
  guilt: '内疚',
  shame: '羞耻',
  neutral: '平静',
  mixed: '复杂',
};
