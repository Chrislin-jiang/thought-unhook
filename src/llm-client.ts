/**
 * LLM API 客户端
 * 
 * 支持 OpenAI 兼容 API（DeepSeek、Qwen、OpenAI、本地 Ollama 等）
 * 特性：
 * - 自动重试 + 超时控制
 * - 本地缓存（避免重复请求）
 * - 优雅降级（API 不可用时返回 null）
 */

// ===== 配置类型 =====

export interface LLMConfig {
  apiKey: string;
  baseUrl: string;         // API 基础地址
  model: string;           // 模型名称
  maxTokens: number;       // 最大返回 token 数
  temperature: number;     // 创造性参数 0-2
  timeout: number;         // 请求超时 ms
  enabled: boolean;        // 是否启用 LLM
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// ===== 预设模型配置 =====

export interface ModelPreset {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  description: string;
  emoji: string;
}

export const MODEL_PRESETS: ModelPreset[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    description: '性价比最高，中文理解优秀',
    emoji: '🐋',
  },
  {
    id: 'doubao',
    name: '豆包',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    model: 'doubao-seed-2.0-lite',
    description: '字节跳动大模型，速度快',
    emoji: '🫘',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    description: '全球领先，多语言强',
    emoji: '🤖',
  },
  {
    id: 'qwen',
    name: '通义千问',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-turbo',
    description: '阿里云大模型，国内快',
    emoji: '🌐',
  },
  {
    id: 'moonshot',
    name: 'Moonshot',
    baseUrl: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    description: 'Kimi 大模型，长文本强',
    emoji: '🌙',
  },
  {
    id: 'ollama',
    name: 'Ollama 本地',
    baseUrl: 'http://localhost:11434/v1',
    model: 'qwen2.5:7b',
    description: '本地运行，无需 API Key',
    emoji: '💻',
  },
  {
    id: 'custom',
    name: '自定义',
    baseUrl: '',
    model: '',
    description: '填写任意 OpenAI 兼容 API',
    emoji: '⚙️',
  },
];

// ===== 默认配置 =====

const DEFAULT_CONFIG: LLMConfig = {
  apiKey: '',
  baseUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  maxTokens: 1024,
  temperature: 0.7,
  timeout: 60000,
  enabled: false,
};

// ===== 配置管理 =====

const CONFIG_STORAGE_KEY = 'offstage-llm-config';

export function getLLMConfig(): LLMConfig {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_CONFIG };
}

export function saveLLMConfig(config: Partial<LLMConfig>): void {
  const current = getLLMConfig();
  const merged = { ...current, ...config };
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(merged));
}

export function isLLMEnabled(): boolean {
  const config = getLLMConfig();
  return config.enabled && (!!config.apiKey || config.baseUrl.includes('localhost'));
}

// ===== 简易缓存 =====

const responseCache = new Map<string, { content: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟缓存

function getCacheKey(messages: LLMMessage[]): string {
  return JSON.stringify(messages.map(m => m.content).join('|'));
}

function getCachedResponse(key: string): string | null {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.content;
  }
  responseCache.delete(key);
  return null;
}

function setCachedResponse(key: string, content: string): void {
  // 控制缓存大小
  if (responseCache.size > 100) {
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }
  responseCache.set(key, { content, timestamp: Date.now() });
}

// ===== API 调用 =====

/**
 * 判断当前是否运行在本地开发服务器（有代理可用）
 */
function isDevServer(): boolean {
  return import.meta.env.DEV;
}

export async function callLLM(
  messages: LLMMessage[],
  options?: Partial<Pick<LLMConfig, 'maxTokens' | 'temperature' | 'timeout'>> & { forceCall?: boolean }
): Promise<LLMResponse | null> {
  const config = getLLMConfig();

  // forceCall 跳过 enabled 检查（用于测试连接）
  if (!options?.forceCall) {
    if (!config.enabled) return null;
    if (!config.apiKey && !config.baseUrl.includes('localhost')) return null;
  }

  // 检查缓存
  const cacheKey = getCacheKey(messages);
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return { content: cached };
  }

  const maxTokens = options?.maxTokens ?? config.maxTokens;
  const temperature = options?.temperature ?? config.temperature;
  const timeout = options?.timeout ?? config.timeout;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const targetUrl = `${config.baseUrl.replace(/\/+$/, '')}/chat/completions`;
    
    const apiHeaders: Record<string, string> = {};
    if (config.apiKey) {
      apiHeaders['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const requestBody = {
      model: config.model,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      max_tokens: maxTokens,
      temperature,
      stream: false,
    };

    let response: Response;

    if (isDevServer()) {
      // 开发模式：通过 Vite 代理中转，避免 CORS
      response = await fetch('/api/llm-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl,
          headers: apiHeaders,
          body: requestBody,
        }),
        signal: controller.signal,
      });

      // 如果代理路由本身 404（Vite 没有注册成功），直接报错
      const contentType = response.headers.get('content-type') || '';
      if (response.status === 404 && contentType.includes('text/html')) {
        throw new Error('LLM 代理未就绪，请重启 dev server');
      }
    } else {
      // 生产模式：直接请求（需要目标 API 支持 CORS，或部署同域服务）
      response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...apiHeaders,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.warn(`[LLM] API error ${response.status}: ${errorText}`);
      
      // 尝试解析 API 错误 JSON 提取更友好的信息
      let friendlyMsg = `API ${response.status}`;
      try {
        const errJson = JSON.parse(errorText);
        const apiMsg = errJson?.error?.message || errJson?.message || '';
        if (apiMsg) {
          friendlyMsg = apiMsg;
        }
      } catch {
        // 非 JSON 响应
        if (errorText.length < 200) friendlyMsg = errorText;
      }
      
      throw new Error(friendlyMsg);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    console.log('[LLM] Response received:', {
      hasContent: !!content,
      contentLength: content?.length,
      contentPreview: content?.slice(0, 80),
      hasReasoningContent: !!data.choices?.[0]?.message?.reasoning_content,
    });

    if (!content) {
      console.warn('[LLM] Empty response from model, full message:', JSON.stringify(data.choices?.[0]?.message));
      throw new Error('模型返回为空');
    }

    // 写入缓存
    setCachedResponse(cacheKey, content);

    return {
      content,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0,
      } : undefined,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.warn('[LLM] Request timeout');
      throw new Error('请求超时，请检查网络或增大超时时间');
    }
    throw err;  // 向上抛出，让调用方处理
  } finally {
    clearTimeout(timeoutId);
  }
}

// ===== 便捷方法 =====

/**
 * 发送单轮对话
 */
export async function chat(
  systemPrompt: string,
  userMessage: string,
  options?: Partial<Pick<LLMConfig, 'maxTokens' | 'temperature' | 'timeout'>> & { forceCall?: boolean }
): Promise<string | null> {
  const messages: LLMMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage },
  ];
  const response = await callLLM(messages, options);
  return response?.content ?? null;
}

/**
 * 发送 JSON 模式对话（要求返回 JSON）
 */
export async function chatJSON<T>(
  systemPrompt: string,
  userMessage: string,
  options?: Partial<Pick<LLMConfig, 'maxTokens' | 'temperature' | 'timeout'>> & { forceCall?: boolean }
): Promise<T | null> {
  const jsonSystemPrompt = systemPrompt + '\n\n请严格以 JSON 格式回复，不要包含 markdown 代码块标记。';
  const content = await chat(jsonSystemPrompt, userMessage, options);
  if (!content) {
    console.warn('[LLM chatJSON] chat() returned null');
    return null;
  }

  console.log('[LLM chatJSON] Raw content:', content.slice(0, 120));

  try {
    // 策略 1：直接解析（理想情况）
    const parsed = JSON.parse(content) as T;
    console.log('[LLM chatJSON] Strategy 1 (direct parse) succeeded');
    return parsed;
  } catch {
    // 策略 2：提取 markdown 代码块中的 JSON
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim()) as T;
      } catch { /* 继续尝试 */ }
    }

    // 策略 3：提取首个 { ... } 或 [ ... ] 块（处理 LLM 在 JSON 前后加了说明文字）
    const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      try {
        return JSON.parse(jsonObjectMatch[0]) as T;
      } catch { /* 继续尝试 */ }
    }
    const jsonArrayMatch = content.match(/\[[\s\S]*\]/);
    if (jsonArrayMatch) {
      try {
        return JSON.parse(jsonArrayMatch[0]) as T;
      } catch { /* 放弃 */ }
    }

    console.warn('[LLM] Failed to parse JSON response:', content.slice(0, 200));
    return null;
  }
}

/**
 * 测试 API 连接
 */
export async function testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
  const config = getLLMConfig();
  
  if (!config.apiKey && !config.baseUrl.includes('localhost')) {
    return { success: false, message: '请先填写 API Key' };
  }

  if (!config.baseUrl) {
    return { success: false, message: '请填写 API 地址' };
  }

  const start = Date.now();
  
  try {
    // forceCall=true 跳过 enabled 检查，允许在未启用时测试
    const result = await chat(
      '你是一个简洁的助手。',
      '请回复"连接成功"四个字。',
      { maxTokens: 20, timeout: 30000, forceCall: true }
    );

    const latency = Date.now() - start;

    if (result) {
      return { success: true, message: `连接成功 (${latency}ms)`, latency };
    } else {
      return { success: false, message: '未收到模型响应，请检查模型名称是否正确' };
    }
  } catch (err) {
    const latency = Date.now() - start;
    const errMsg = err instanceof Error ? err.message : String(err);
    
    // 提供更友好的错误信息
    if (errMsg.includes('401') || errMsg.includes('Unauthorized') || errMsg.includes('auth')) {
      return { success: false, message: 'API Key 无效或已过期' };
    }
    if (errMsg.includes('403') || errMsg.includes('Forbidden')) {
      return { success: false, message: 'API Key 权限不足，请检查是否有对应模型的访问权限' };
    }
    if (errMsg.includes('InvalidEndpointOrModel') || errMsg.includes('does not exist or you do not have access')) {
      return { success: false, message: '模型名称不正确。火山引擎请使用接入点 ID（ep-xxx 格式），可在火山方舟控制台获取' };
    }
    if (errMsg.includes('404') || errMsg.includes('not found') || errMsg.includes('NotFound')) {
      return { success: false, message: '接口地址不存在，请检查 API 地址和模型名称' };
    }
    if (errMsg.includes('429')) {
      return { success: false, message: 'API 请求频率超限，请稍后重试' };
    }
    if (errMsg.includes('502') || errMsg.includes('Proxy')) {
      return { success: false, message: `代理请求失败: ${errMsg}` };
    }
    if (errMsg.includes('超时')) {
      return { success: false, message: `请求超时 (${latency}ms)，请检查网络或 API 地址` };
    }
    if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError')) {
      return { success: false, message: 'CORS 跨域错误或网络不可达，请检查 API 地址' };
    }
    
    return { success: false, message: `连接失败: ${errMsg}` };
  }
}
