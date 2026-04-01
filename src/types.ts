// ===== Phase 3 核心类型 =====

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

// Phase 2.1: 练习类型
export type PracticeType =
  | 'thought-train'     // 🚂 念头列车
  | 'thought-tv'        // 📺 念头电视
  | 'cloud-writing'     // ☁️ 云上书写
  | 'balloon-release'   // 🎈 气球释放
  | 'drift-bottle'      // 🌊 念头漂流瓶
  | 'microscope'        // 🔬 念头显微镜
  | 'meet-personas';    // 👿 认识脑内角色

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

// Phase 3: 主题类型
export type ThemeType = 'cosmos' | 'starry' | 'ocean' | 'forest' | 'void' | 'theater';

// Phase 3: 行为建议
export interface BehaviorSuggestion {
  trigger: string;         // 触发条件描述
  suggestion: string;      // 建议内容
  emoji: string;           // 配套emoji
  actionLabel: string;     // 行动按钮文字
  duration?: string;       // 建议时长
}

// Phase 3: 解钩推荐结果
export interface UnhookRecommendation {
  method: ReleaseMethod;
  reason: string;          // 推荐理由
  confidence: number;      // 0-1 推荐置信度
  isPersonalized: boolean; // 是否为个性化推荐
}

// Phase 3: 分享报告
export interface ShareReport {
  date: string;
  totalThoughts: number;
  releasedCount: number;
  topEmotion: EmotionType;
  topMethod?: ReleaseMethod;
  topPersona?: PersonaType;
  releaseRate: number;
  streak: number;           // 连续使用天数
  insight: string;          // AI 洞察
}

// Phase 3: 念头艺术画
export interface ThoughtArt {
  thought: string;
  emotion: EmotionType;
  style: 'watercolor' | 'ink' | 'pixel' | 'geometric';
  palette: string[];        // 色彩数组
}

// 应用设置
export interface AppSettings {
  theme: ThemeType;
  nightModeEnabled: boolean;
  onboardingCompleted: boolean;
}

// Phase 2.1: 角色卡片详细信息
export interface PersonaCard {
  type: PersonaType;
  nickname?: string;       // 用户起的昵称
  greeting: string;        // 角色自我介绍
  thoughtCount: number;    // 归属念头数
  firstSeen: number;       // 首次出现时间
  recentThoughts: string[]; // 最近的念头内容
}

// Phase 2.1: 练习记录
export interface PracticeRecord {
  id: string;
  type: PracticeType;
  completedAt: number;
  duration: number;       // 秒
  thoughtsUsed: string[]; // 使用的念头内容
}

// Phase 2.1: 练习信息
export interface PracticeInfo {
  type: PracticeType;
  name: string;
  emoji: string;
  duration: string;
  description: string;
  mechanism: string;
}

// ===== 视觉常量 =====

// 气泡的情绪颜色映射 — 柔和马卡龙色
export const EMOTION_COLORS: Record<EmotionType, { bg: string; glow: string; text: string }> = {
  anxiety:  { bg: 'rgba(255, 181, 181, 0.2)',  glow: 'rgba(255, 181, 181, 0.25)', text: '#D46A6A' },
  anger:    { bg: 'rgba(255, 155, 155, 0.2)',  glow: 'rgba(255, 155, 155, 0.25)', text: '#C75050' },
  sadness:  { bg: 'rgba(157, 196, 232, 0.2)',  glow: 'rgba(157, 196, 232, 0.25)', text: '#5B8DB8' },
  fear:     { bg: 'rgba(197, 163, 217, 0.2)',  glow: 'rgba(197, 163, 217, 0.25)', text: '#8B6BA8' },
  guilt:    { bg: 'rgba(232, 201, 155, 0.2)',  glow: 'rgba(232, 201, 155, 0.25)', text: '#B08845' },
  shame:    { bg: 'rgba(212, 181, 181, 0.2)',  glow: 'rgba(212, 181, 181, 0.25)', text: '#9E7070' },
  neutral:  { bg: 'rgba(168, 216, 232, 0.18)', glow: 'rgba(168, 216, 232, 0.22)', text: '#5A9BB0' },
  mixed:    { bg: 'rgba(197, 179, 217, 0.2)',  glow: 'rgba(197, 179, 217, 0.25)', text: '#7E68A0' },
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

// 内在角色信息（Phase 2.1 增强版，含角色自我介绍）
export const PERSONA_INFO: Record<PersonaType, { emoji: string; name: string; shortName: string; description: string; greeting: string }> = {
  'anxiety-monster':  { emoji: '👿', name: '焦虑怪', shortName: '焦虑怪', description: '不断颤抖的小恶魔，它的工作是让你担心一切可能出错的事', greeting: '嗨，我是焦虑怪！我的工作就是让你提前担心所有可能出错的事。虽然有时候我有点烦人，但我其实是想保护你。只不过……我总是用力过猛了 😅' },
  'perfectionist-ai': { emoji: '🤖', name: '完美主义AI', shortName: '完美主义', description: '冰冷的机器人，总觉得你还不够好，需要再努力', greeting: '你好。我是完美主义AI。我的程序只有一个目标：让你变得更好。标准？永远是100分。我知道这让你很累，但在我的系统里，"够好了"这个词……不存在。' },
  'inner-child':      { emoji: '👶', name: '内在小孩', shortName: '内在小孩', description: '蜷缩的小人，害怕被抛弃，需要安全感', greeting: '我是内在小孩……我住在你心里很深很深的地方。我害怕被忽视、被抛弃。当你感到不安全的时候，其实是我在哭。我只是需要一个拥抱 🤗' },
  'performer':        { emoji: '🎭', name: '表演者', shortName: '表演者', description: '戴面具的人，总担心别人怎么看自己', greeting: '我是表演者！我时刻关注着舞台下的观众——也就是所有人。他们在看什么？在想什么？对你满意吗？别怪我，我只是太在意别人的掌声了 🎪' },
  'judge':            { emoji: '📢', name: '评判官', shortName: '评判官', description: '拿锤子的法官，对一切下定论', greeting: '庭审开始！我是评判官。我对所有事情都有定论——尤其是对你。错了？判有罪。没做好？判有罪。我知道这不公平，但我停不下来啊 ⚖️' },
  'fortune-teller':   { emoji: '🔮', name: '预言家', shortName: '预言家', description: '水晶球先知，总是预见最坏的结局', greeting: '我是预言家，我能看到未来——至少我觉得我能。坏消息是：我预见的结局总是最糟糕的那个。好消息是：我的预言准确率其实很低 🔮' },
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
  observe:  { emoji: '🫧', name: '看见', description: '从台上走到台下，看这出戏' },
  label:    { emoji: '🏷️', name: '贴标签', description: '给这出戏标注类型：悲剧？闹剧？' },
  rewrite:  { emoji: '✏️', name: '改写', description: '给角色换一份新台词' },
  voice:    { emoji: '🎵', name: '变声', description: '让角色用滑稽腔重新念台词' },
  resize:   { emoji: '🔍', name: '缩小', description: '舞台渐渐缩小，戏也变远了' },
  blow:     { emoji: '💨', name: '吹走', description: '幕布落下，这场戏散了' },
  melt:     { emoji: '🫠', name: '融化', description: '灯光渐暗，布景慢慢融入黑暗' },
  store:    { emoji: '📌', name: '暂存', description: '先存进剧本库，不急着上演' },
};

// Phase 3: 主题信息 — 柔和浅色系
export const THEME_INFO: Record<ThemeType, { name: string; emoji: string; description: string; bgColor: string }> = {
  cosmos:  { name: '薰衣草', emoji: '💜', description: '温柔的紫色花田', bgColor: '#F8F6FF' },
  starry:  { name: '夜空', emoji: '🌙', description: '安静的夜晚模式', bgColor: '#1a1a2e' },
  ocean:   { name: '海盐', emoji: '🌊', description: '清爽的海洋微风', bgColor: '#F0F7FF' },
  forest:  { name: '抹茶', emoji: '🌿', description: '清新的林间小径', bgColor: '#F0F9F0' },
  void:    { name: '奶茶', emoji: '☕', description: '温暖的午后时光', bgColor: '#FFF8F0' },
  theater: { name: '蜜桃', emoji: '🍑', description: '甜蜜的粉色世界', bgColor: '#FFF5F5' },
};

// Phase 2.1: 解钩实验室练习列表
export const PRACTICE_LIST: PracticeInfo[] = [
  {
    type: 'thought-train',
    name: '念头列车',
    emoji: '🚂',
    duration: '3分钟',
    description: '念头变成列车车厢，看它们驶过站台',
    mechanism: '你只是站台上的观察者，列车会自己开走',
  },
  {
    type: 'thought-tv',
    name: '念头电视',
    emoji: '📺',
    duration: '2分钟',
    description: '念头变成电视屏幕上的字幕',
    mechanism: '你手持遥控器，可以调台、静音、关机',
  },
  {
    type: 'cloud-writing',
    name: '云上书写',
    emoji: '☁️',
    duration: '3分钟',
    description: '念头变成云朵上的文字',
    mechanism: '风吹过，文字渐渐散去',
  },
  {
    type: 'balloon-release',
    name: '气球释放',
    emoji: '🎈',
    duration: '2分钟',
    description: '每个念头绑在一个气球上',
    mechanism: '松手让它飞走，越飞越高越小',
  },
  {
    type: 'drift-bottle',
    name: '念头漂流瓶',
    emoji: '🌊',
    duration: '3分钟',
    description: '念头装进瓶子，放入海浪',
    mechanism: '看它慢慢漂远，消失在海平线',
  },
  {
    type: 'microscope',
    name: '念头显微镜',
    emoji: '🔬',
    duration: '4分钟',
    description: '用显微镜观察念头的微观结构',
    mechanism: '拆解为词语→音节→符号→像素→消散',
  },
  {
    type: 'meet-personas',
    name: '认识脑内角色',
    emoji: '👿',
    duration: '5分钟',
    description: '输入多个念头，AI识别你的内在角色阵容',
    mechanism: '逐个认识住在你脑子里的小伙伴们',
  },
];
