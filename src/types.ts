// ===== Phase 1 MVP 核心类型 =====

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

// Phase 1: 完整 8 种解钩方式
export type ReleaseMethod =
  | 'observe'     // 🫧 看见
  | 'label'       // 🏷️ 贴标签
  | 'rewrite'     // ✏️ 改写
  | 'voice'       // 🎵 变声
  | 'resize'      // 🔍 放大/缩小
  | 'blow'        // 💨 吹走
  | 'melt'        // 🫠 融化
  | 'store';      // 📌 暂存

export interface Thought {
  id?: number;  // auto-increment for IndexedDB
  uid: string;  // unique string id
  content: string;
  rewrittenContent?: string;
  createdAt: number;
  emotion: EmotionType;
  intensity: number;
  stickiness: number;          // 粘性 1-10
  cognitiveDistortion: CognitiveDistortion;
  persona: PersonaType;
  tags: string[];
  status: 'active' | 'stored' | 'released';
  releasedAt?: number;
  releaseMethod?: ReleaseMethod;
  recurrenceCount: number;
}

// Onboarding 状态
export interface OnboardingState {
  completed: boolean;
  step: number;
}

// 觉察日志统计
export interface DailyStats {
  date: string; // YYYY-MM-DD
  thoughtCount: number;
  releasedCount: number;
  storedCount: number;
  emotions: Record<EmotionType, number>;
  distortions: Record<CognitiveDistortion, number>;
  personas: Record<PersonaType, number>;
  methods: Record<ReleaseMethod, number>;
}

// 应用设置
export interface AppSettings {
  theme: 'starry' | 'ocean' | 'forest' | 'void';
  nightModeEnabled: boolean;
  onboardingCompleted: boolean;
}

// ===== 视觉常量 =====

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
export const PERSONA_INFO: Record<PersonaType, { emoji: string; name: string; shortName: string; description: string }> = {
  'anxiety-monster':  { emoji: '👿', name: '焦虑怪', shortName: '焦虑怪', description: '不断颤抖的小恶魔，它的工作是让你担心一切可能出错的事' },
  'perfectionist-ai': { emoji: '🤖', name: '完美主义AI', shortName: '完美主义', description: '冰冷的机器人，总觉得你还不够好，需要再努力' },
  'inner-child':      { emoji: '👶', name: '内在小孩', shortName: '内在小孩', description: '蜷缩的小人，害怕被抛弃，需要安全感' },
  'performer':        { emoji: '🎭', name: '表演者', shortName: '表演者', description: '戴面具的人，总担心别人怎么看自己' },
  'judge':            { emoji: '📢', name: '评判官', shortName: '评判官', description: '拿锤子的法官，对一切下定论' },
  'fortune-teller':   { emoji: '🔮', name: '预言家', shortName: '预言家', description: '水晶球先知，总是预见最坏的结局' },
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

// 解钩操作信息
export const RELEASE_METHOD_INFO: Record<ReleaseMethod, { emoji: string; name: string; description: string }> = {
  observe:  { emoji: '🫧', name: '看见', description: '念头从脑内文字变为眼前漂浮物' },
  label:    { emoji: '🏷️', name: '贴标签', description: '"这是一个关于未来的担忧"' },
  rewrite:  { emoji: '✏️', name: '改写', description: '"我注意到我在想…"' },
  voice:    { emoji: '🎵', name: '变声', description: '用卡通音重新播放念头' },
  resize:   { emoji: '🔍', name: '缩小', description: '让念头变得越来越小' },
  blow:     { emoji: '💨', name: '吹走', description: '让气泡飘走' },
  melt:     { emoji: '🫠', name: '融化', description: '看着念头慢慢变透明消失' },
  store:    { emoji: '📌', name: '暂存', description: '放进念头罐，不急着处理' },
};
