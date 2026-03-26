/**
 * AI 服务 — Phase 2.1
 * 
 * Layer 1 完整版: 深度语义分类（多维度加权 + 上下文分析）
 * Layer 2: 自动解钩改写（模板版）
 * Layer 4: 念头人格化（角色识别 + 自我介绍 + 昵称）
 * + 语音输入（Web Speech Recognition API）
 */

import type {
  EmotionType,
  CognitiveDistortion,
  PersonaType,
} from './types';
import { PERSONA_INFO } from './types';

// ===== Layer 1 完整版: 深度语义分类 =====

interface ClassifyResult {
  emotion: EmotionType;
  cognitiveDistortion: CognitiveDistortion;
  persona: PersonaType;
  intensity: number;
  tags: string[];
  confidence: number;        // 分类置信度 0-1
  secondaryEmotion?: EmotionType;  // 次要情绪
  subDistortions: CognitiveDistortion[];  // 可能存在的多种扭曲
}

// 深度关键词规则库（增强版，更多同义词和语境匹配）
const EMOTION_KEYWORDS: Array<{ keywords: string[]; emotion: EmotionType; weight: number }> = [
  { keywords: ['担心', '焦虑', '不安', '紧张', '害怕', '恐惧', '万一', '怎么办', '忐忑', '慌', '心神不宁', '坐立不安', '惶恐'], emotion: 'anxiety', weight: 2 },
  { keywords: ['生气', '愤怒', '烦', '讨厌', '受不了', '气死', '凭什么', '恼火', '暴躁', '忍无可忍', '火大', '窝火'], emotion: 'anger', weight: 2 },
  { keywords: ['难过', '伤心', '悲', '哭', '失去', '孤独', '寂寞', '想念', '心疼', '落寞', '沮丧', '低落', '消沉', '空虚'], emotion: 'sadness', weight: 2 },
  { keywords: ['怕', '恐惧', '害怕', '吓', '可怕', '不敢', '畏惧', '惊恐', '颤抖', '发抖'], emotion: 'fear', weight: 2 },
  { keywords: ['内疚', '对不起', '愧疚', '错', '道歉', '抱歉', '我的错', '自责', '后悔', '悔恨', '负罪'], emotion: 'guilt', weight: 2 },
  { keywords: ['丢脸', '羞耻', '丢人', '尴尬', '没脸', '笑话', '羞愧', '耻辱', '丢脸', '颜面'], emotion: 'shame', weight: 2 },
  // 隐含情绪关键词（较低权重但更广泛覆盖）
  { keywords: ['失败', '做不好', '不够好', '不行', '完了', '糟糕', '完蛋', '搞砸', '崩溃', '绝望'], emotion: 'anxiety', weight: 1.5 },
  { keywords: ['应该', '必须', '一定要', '不能不', '不允许', '绝对不能'], emotion: 'guilt', weight: 1 },
  { keywords: ['无聊', '没意思', '无所谓', '随便', '算了'], emotion: 'neutral', weight: 0.5 },
  { keywords: ['复杂', '矛盾', '纠结', '说不清', '五味杂陈', '百感交集'], emotion: 'mixed', weight: 1.5 },
  // 身体感受相关（具身认知）
  { keywords: ['头痛', '胸闷', '喘不过气', '窒息', '压抑', '堵'], emotion: 'anxiety', weight: 1.5 },
  { keywords: ['心碎', '心痛', '心酸', '泪', '眼眶'], emotion: 'sadness', weight: 1.5 },
];

// 增强版认知扭曲检测（多模式匹配+语义分析）
const DISTORTION_PATTERNS: Array<{ patterns: RegExp[]; distortion: CognitiveDistortion; weight: number }> = [
  { patterns: [/肯定会.*失败/, /一定会.*糟/, /完了/, /完蛋/, /没救/, /死定了/, /毁了/, /没希望/, /世界末日/, /天塌了/], distortion: 'catastrophizing', weight: 2 },
  { patterns: [/什么都/, /永远/, /从来/, /总是/, /一直/, /每次都/, /没有一次/, /所有人都/, /从来没/, /不可能/], distortion: 'overgeneralization', weight: 2 },
  { patterns: [/他.*觉得/, /她.*觉得/, /他们.*认为/, /别人.*看/, /讨厌我/, /不喜欢我/, /瞧不起/, /在背后/, /肯定在想/], distortion: 'mind-reading', weight: 2 },
  { patterns: [/应该/, /必须/, /不得不/, /一定要/, /理应/, /本该/, /不应该/, /怎么可以/], distortion: 'should-statements', weight: 1.5 },
  { patterns: [/都是我的错/, /全怪我/, /因为我/, /都怪我/, /是我害的/, /我的问题/, /我造成的/], distortion: 'personalization', weight: 2 },
  { patterns: [/要么.*要么/, /不是.*就是/, /只有.*才/, /如果不.*就/, /非此即彼/, /除非.*否则/], distortion: 'black-white', weight: 2 },
  { patterns: [/我觉得.*所以/, /感觉.*肯定/, /直觉告诉/, /我感觉.*一定/], distortion: 'emotional-reasoning', weight: 1.5 },
  { patterns: [/肯定会/, /一定会/, /注定/, /命中/, /早就知道/, /迟早/, /预感/], distortion: 'fortune-telling', weight: 1.5 },
  { patterns: [/我就是.*笨/, /我就是.*差/, /我是个.*人/, /我天生/, /我本来就/, /我这种人/], distortion: 'labeling', weight: 2 },
  { patterns: [/不算什么/, /只是运气/, /任何人都能/, /没什么大不了/, /算不了什么/, /谁都行/], distortion: 'discounting-positive', weight: 1.5 },
];

const PERSONA_MAPPING: Record<CognitiveDistortion, PersonaType> = {
  'catastrophizing': 'fortune-teller',
  'overgeneralization': 'judge',
  'mind-reading': 'performer',
  'should-statements': 'perfectionist-ai',
  'personalization': 'judge',
  'black-white': 'perfectionist-ai',
  'emotional-reasoning': 'inner-child',
  'fortune-telling': 'fortune-teller',
  'labeling': 'judge',
  'discounting-positive': 'perfectionist-ai',
  'unknown': 'anxiety-monster',
};

// 深度情绪→角色映射（当认知扭曲无法确定时的备选方案）
const EMOTION_PERSONA_FALLBACK: Partial<Record<EmotionType, PersonaType>> = {
  'anxiety': 'anxiety-monster',
  'fear': 'anxiety-monster',
  'guilt': 'judge',
  'shame': 'performer',
  'sadness': 'inner-child',
  'anger': 'judge',
};

// 标签提取关键词（增强版）
const TAG_KEYWORDS: Array<{ keywords: string[]; tag: string }> = [
  { keywords: ['工作', '项目', '任务', '会议', '同事', '领导', '老板', '需求', '加班', '职场', '绩效', '升职', '裁员', '面试'], tag: '工作' },
  { keywords: ['考试', '学习', '成绩', '分数', '作业', '论文', '毕业', '学校', '课程', '复习', '挂科'], tag: '学习' },
  { keywords: ['朋友', '社交', '关系', '感情', '恋爱', '对象', '爱情', '分手', '表白', '暗恋', '吵架'], tag: '人际' },
  { keywords: ['钱', '经济', '房', '贷', '工资', '花费', '存款', '债', '消费', '破产'], tag: '经济' },
  { keywords: ['健康', '身体', '病', '医', '睡', '累', '疲', '头疼', '失眠', '焦虑症', '抑郁'], tag: '健康' },
  { keywords: ['未来', '将来', '明天', '以后', '前途', '规划', '方向', '出路'], tag: '未来' },
  { keywords: ['过去', '后悔', '曾经', '当初', '那时', '回忆', '从前', '以前'], tag: '过去' },
  { keywords: ['自己', '自我', '不够', '配不上', '不值得', '废物', '没用', '价值'], tag: '自我价值' },
  { keywords: ['家人', '父母', '爸妈', '孩子', '老公', '老婆', '家庭', '婚姻'], tag: '家庭' },
  { keywords: ['外表', '胖', '瘦', '丑', '长相', '身材', '颜值'], tag: '外貌' },
];

export function classifyThought(content: string): ClassifyResult {
  // 1. 多维度情绪检测
  const emotionScores: Partial<Record<EmotionType, number>> = {};
  for (const rule of EMOTION_KEYWORDS) {
    for (const keyword of rule.keywords) {
      if (content.includes(keyword)) {
        const prev = emotionScores[rule.emotion] || 0;
        emotionScores[rule.emotion] = prev + rule.weight;
      }
    }
  }

  // 语境增强：否定词反转
  const negativePatterns = [/不是.*焦虑/, /没有.*担心/, /不.*害怕/];
  for (const pat of negativePatterns) {
    if (pat.test(content)) {
      if (emotionScores['anxiety']) emotionScores['anxiety']! *= 0.5;
    }
  }

  let emotion: EmotionType = 'neutral';
  let maxScore = 0;
  let secondaryEmotion: EmotionType | undefined;
  let secondMaxScore = 0;

  for (const [emo, score] of Object.entries(emotionScores)) {
    if (score > maxScore) {
      secondaryEmotion = emotion !== 'neutral' ? emotion : undefined;
      secondMaxScore = maxScore;
      maxScore = score;
      emotion = emo as EmotionType;
    } else if (score > secondMaxScore) {
      secondMaxScore = score;
      secondaryEmotion = emo as EmotionType;
    }
  }

  // 多种情绪同时存在时标记为mixed
  const significantEmotions = Object.values(emotionScores).filter(s => s >= 2);
  if (significantEmotions.length > 1) {
    emotion = 'mixed';
  }

  // 2. 深度认知扭曲检测（可检测多种扭曲）
  const detectedDistortions: Array<{ distortion: CognitiveDistortion; weight: number }> = [];

  for (const rule of DISTORTION_PATTERNS) {
    for (const pattern of rule.patterns) {
      if (pattern.test(content)) {
        detectedDistortions.push({ distortion: rule.distortion, weight: rule.weight });
        break;
      }
    }
  }

  // 按权重排序
  detectedDistortions.sort((a, b) => b.weight - a.weight);
  const cognitiveDistortion = detectedDistortions[0]?.distortion || 'unknown';
  const subDistortions = detectedDistortions.map(d => d.distortion);

  // 3. 智能角色分配（认知扭曲 → 角色 → 情绪兜底）
  let persona = PERSONA_MAPPING[cognitiveDistortion];
  if (cognitiveDistortion === 'unknown' && emotion !== 'neutral') {
    persona = EMOTION_PERSONA_FALLBACK[emotion] || 'anxiety-monster';
  }

  // 4. 精确强度估算
  let intensity = 4;
  if (content.includes('!') || content.includes('！')) intensity += 1;
  if (content.includes('!!') || content.includes('！！')) intensity += 1;
  if (content.length > 20) intensity += 1;
  if (content.length > 40) intensity += 0.5;
  if (maxScore >= 3) intensity += 1;
  if (maxScore >= 5) intensity += 1;
  if (detectedDistortions.length >= 2) intensity += 1;
  // 高强度关键词
  if (/绝望|崩溃|死|受不了|窒息/.test(content)) intensity += 2;
  intensity = Math.min(10, Math.max(1, Math.round(intensity)));

  // 5. 增强标签提取
  const tags: string[] = [];
  for (const rule of TAG_KEYWORDS) {
    for (const keyword of rule.keywords) {
      if (content.includes(keyword) && !tags.includes(rule.tag)) {
        tags.push(rule.tag);
        break;
      }
    }
  }

  // 6. 置信度计算
  const confidence = Math.min(1, (maxScore / 5) * 0.6 + (detectedDistortions.length > 0 ? 0.3 : 0) + (tags.length > 0 ? 0.1 : 0));

  return {
    emotion,
    cognitiveDistortion,
    persona,
    intensity,
    tags,
    confidence,
    secondaryEmotion,
    subDistortions,
  };
}

// ===== Layer 2: 自动解钩改写（增强版）=====

interface RewriteResult {
  variants: Array<{
    text: string;
    technique: string;
    techniqueName: string;
  }>;
}

export function rewriteThought(content: string): RewriteResult {
  const cleaned = content.replace(/[。！？!?.]+$/, '');

  return {
    variants: [
      {
        text: `我注意到我在想：「${cleaned}」`,
        technique: 'awareness-prefix',
        techniqueName: '觉察前缀',
      },
      {
        text: `我正在产生一个想法：「${cleaned}」`,
        technique: 'objectification',
        techniqueName: '客体化',
      },
      {
        text: `我的大脑在告诉我一个故事：「${cleaned}」`,
        technique: 'narrative',
        techniqueName: '叙事化',
      },
      {
        text: `「${cleaned}」这个念头又来了，像个老朋友`,
        technique: 'personification',
        techniqueName: '拟人化',
      },
    ],
  };
}

// ===== 自动标签生成 =====

export function generateLabel(content: string, emotion: EmotionType, distortion: CognitiveDistortion): string {
  const emotionMap: Record<string, string> = {
    anxiety: '未来的担忧', anger: '愤怒', sadness: '悲伤',
    fear: '恐惧', guilt: '内疚', shame: '羞耻', neutral: '日常想法', mixed: '复杂情绪',
  };
  const distortionMap: Record<string, string> = {
    catastrophizing: '灾难化', overgeneralization: '过度概括', 'mind-reading': '揣测他人',
    'should-statements': '应该思维', personalization: '自我归因', 'black-white': '极端化',
    'emotional-reasoning': '情绪推理', 'fortune-telling': '预测未来', labeling: '自我标签',
    'discounting-positive': '否定积极', unknown: '',
  };

  const emo = emotionMap[emotion] || '想法';
  const dist = distortionMap[distortion];
  
  return dist ? `这是一个关于「${emo}」的${dist}念头` : `这是一个关于「${emo}」的念头`;
}

// ===== Layer 4: 念头人格化 =====

export interface PersonaIdentifyResult {
  personas: Array<{
    type: PersonaType;
    name: string;
    emoji: string;
    greeting: string;
    thoughts: string[];
    frequency: number;
  }>;
}

export function identifyPersonas(thoughts: Array<{ content: string; persona: PersonaType }>): PersonaIdentifyResult {
  // 按角色分组
  const personaMap = new Map<PersonaType, string[]>();
  for (const t of thoughts) {
    const existing = personaMap.get(t.persona) || [];
    existing.push(t.content);
    personaMap.set(t.persona, existing);
  }

  // 转换为结果
  const personas = Array.from(personaMap.entries())
    .map(([type, thoughtList]) => {
      const info = PERSONA_INFO[type];
      return {
        type,
        name: info.name,
        emoji: info.emoji,
        greeting: info.greeting,
        thoughts: thoughtList,
        frequency: thoughtList.length,
      };
    })
    .sort((a, b) => b.frequency - a.frequency);

  return { personas };
}

// 为单个角色生成个性化问候语
export function generatePersonaGreeting(type: PersonaType, thoughtCount: number, nickname?: string): string {
  const info = PERSONA_INFO[type];
  const displayName = nickname || info.name;
  
  const greetings: Record<PersonaType, string[]> = {
    'anxiety-monster': [
      `嗨，我是${displayName}！你已经听到我${thoughtCount}次了。虽然我总是在担心，但其实我只是想保护你 💪`,
      `又是我，${displayName}。我知道我很烦，但万一……好吧，也许这次可以放松一下 😮‍💨`,
    ],
    'perfectionist-ai': [
      `${displayName}报到。系统检测到你已经很努力了（${thoughtCount}次提醒）。也许是时候升级一下我的标准了？🔧`,
      `我是${displayName}，你的内在质检员。嗯，其实${thoughtCount}次出场有点多了，我考虑给你放个假。`,
    ],
    'inner-child': [
      `我是${displayName}……你听到我${thoughtCount}次了。谢谢你愿意看见我 🤗`,
      `${displayName}小声说：你注意到我了，这让我感觉好多了。`,
    ],
    'performer': [
      `${displayName}再次登场！第${thoughtCount}次了。观众席上其实没那么多人在看哦 🎪`,
      `嗨，我是${displayName}。也许是时候把面具摘下来休息一下了？`,
    ],
    'judge': [
      `法庭重新开庭——等等，${displayName}觉得今天可以休庭了。你已经被审判${thoughtCount}次了。⚖️`,
      `我是${displayName}。出场${thoughtCount}次后，我承认：我的判决不总是公正的。`,
    ],
    'fortune-teller': [
      `${displayName}来了！我已经做了${thoughtCount}次预言。但坦白说……大部分都没成真 🔮`,
      `我是${displayName}，你的私人预言家。不过${thoughtCount}次预测后，我的准确率堪忧啊。`,
    ],
  };

  const options = greetings[type] || [`嗨，我是${displayName}。`];
  return options[Math.floor(Math.random() * options.length)];
}

// ===== TTS 变声（Web Speech API）=====

export interface VoiceOption {
  id: string;
  name: string;
  emoji: string;
  rate: number;
  pitch: number;
}

export const FUNNY_VOICES: VoiceOption[] = [
  { id: 'chipmunk', name: '花栗鼠', emoji: '🐿️', rate: 1.8, pitch: 2 },
  { id: 'slow', name: '超级慢速', emoji: '🐌', rate: 0.4, pitch: 0.8 },
  { id: 'robot', name: '机器人', emoji: '🤖', rate: 1.0, pitch: 0.1 },
  { id: 'dramatic', name: '浮夸播报', emoji: '📢', rate: 0.7, pitch: 1.5 },
];

export function speakThought(content: string, voice: VoiceOption): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('浏览器不支持语音合成'));
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = 'zh-CN';
    utterance.rate = voice.rate;
    utterance.pitch = voice.pitch;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.startsWith('zh'));
    if (zhVoice) {
      utterance.voice = zhVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utterance);
  });
}

export function preloadVoices(): void {
  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
  }
}

// ===== 语音输入（Web Speech Recognition API）=====

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function isSpeechRecognitionSupported(): boolean {
  return !!SpeechRecognitionAPI;
}

export function createSpeechRecognition(options: {
  onResult: (text: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
  onStart: () => void;
}): { start: () => void; stop: () => void } | null {
  if (!SpeechRecognitionAPI) return null;

  const recognition: SpeechRecognitionInstance = new SpeechRecognitionAPI();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'zh-CN';

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }

    if (finalTranscript) {
      options.onResult(finalTranscript, true);
    } else if (interimTranscript) {
      options.onResult(interimTranscript, false);
    }
  };

  recognition.onerror = (event) => {
    options.onError(event.error);
  };

  recognition.onend = () => {
    options.onEnd();
  };

  recognition.onstart = () => {
    options.onStart();
  };

  return {
    start: () => {
      try {
        recognition.start();
      } catch {
        // Already started
      }
    },
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // Already stopped
      }
    },
  };
}
