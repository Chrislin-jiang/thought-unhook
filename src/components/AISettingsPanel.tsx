/**
 * AI 设置面板组件
 * 
 * 配置 LLM API 连接（DeepSeek / OpenAI / 通义千问 / Moonshot / 本地 Ollama）
 * 支持一键预设切换 + 连接测试
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLLMConfig, saveLLMConfig, testConnection, MODEL_PRESETS, isLLMEnabled } from '../llm-client';
import type { LLMConfig, ModelPreset } from '../llm-client';

interface AISettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AISettingsPanel({ isOpen, onClose }: AISettingsPanelProps) {
  const [config, setConfig] = useState<LLMConfig>(getLLMConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getLLMConfig());
      setTestResult(null);
      setSaved(false);
      // 识别当前匹配的预设
      const current = getLLMConfig();
      const matched = MODEL_PRESETS.find(p => p.baseUrl === current.baseUrl && p.model === current.model);
      setSelectedPreset(matched?.id || 'custom');
    }
  }, [isOpen]);

  const handlePresetSelect = useCallback((preset: ModelPreset) => {
    setSelectedPreset(preset.id);
    if (preset.id !== 'custom') {
      setConfig(prev => ({
        ...prev,
        baseUrl: preset.baseUrl,
        model: preset.model,
      }));
    }
    setTestResult(null);
  }, []);

  const handleSave = useCallback(() => {
    saveLLMConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [config]);

  const handleTest = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    // 先保存当前配置，test 会读取 localStorage
    saveLLMConfig(config);
    const result = await testConnection();
    setTestResult(result);
    setTesting(false);
  }, [config]);

  const handleToggle = useCallback((enabled: boolean) => {
    setConfig(prev => ({ ...prev, enabled }));
    saveLLMConfig({ enabled });
  }, []);

  if (!isOpen) return null;

  const aiEnabled = isLLMEnabled();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg rounded-t-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(25,20,40,0.98), rgba(15,12,30,0.99))',
            maxHeight: '85vh',
            overflowY: 'auto',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* 顶部手柄 */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
          </div>

          {/* 标题 */}
          <div className="px-5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'rgba(230,230,250,0.9)' }}>
                  🧠 AI 大模型设置
                </h2>
                <p className="text-xs mt-1" style={{ color: 'rgba(200,200,230,0.4)' }}>
                  接入 AI 大模型，获得更深度的念头分析和改写
                </p>
              </div>
              {/* 总开关 */}
              <button
                onClick={() => handleToggle(!config.enabled)}
                className="relative w-12 h-6 rounded-full transition-colors"
                style={{
                  background: config.enabled
                    ? 'linear-gradient(135deg, rgba(139,120,255,0.8), rgba(100,180,255,0.8))'
                    : 'rgba(255,255,255,0.1)',
                }}
              >
                <motion.div
                  animate={{ x: config.enabled ? 24 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 rounded-full"
                  style={{ background: '#fff' }}
                />
              </button>
            </div>

            {/* 当前状态 */}
            <div className="mt-3 flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: aiEnabled ? '#4ade80' : 'rgba(255,255,255,0.2)' }}
              />
              <span className="text-xs" style={{ color: aiEnabled ? 'rgba(74,222,128,0.8)' : 'rgba(200,200,230,0.4)' }}>
                {aiEnabled ? 'AI 增强已启用' : config.enabled ? '需要配置 API Key' : 'AI 增强未启用（使用本地规则）'}
              </span>
            </div>
          </div>

          {/* 模型预设选择 */}
          <div className="px-5 pb-4">
            <label className="text-xs block mb-2" style={{ color: 'rgba(200,200,230,0.5)' }}>
              选择模型服务
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MODEL_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className="p-2 rounded-xl text-left transition-all"
                  style={{
                    background: selectedPreset === preset.id
                      ? 'rgba(139,120,255,0.15)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${
                      selectedPreset === preset.id
                        ? 'rgba(139,120,255,0.4)'
                        : 'rgba(255,255,255,0.06)'
                    }`,
                  }}
                >
                  <span className="text-base">{preset.emoji}</span>
                  <p className="text-[10px] mt-1 font-medium truncate" style={{ color: 'rgba(230,230,250,0.8)' }}>
                    {preset.name}
                  </p>
                  <p className="text-[8px] mt-0.5 truncate" style={{ color: 'rgba(200,200,230,0.35)' }}>
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* API 配置表单 */}
          <div className="px-5 pb-4 space-y-3">
            {/* API Key */}
            <div>
              <label className="text-xs block mb-1.5" style={{ color: 'rgba(200,200,230,0.5)' }}>
                API Key {selectedPreset === 'ollama' && <span style={{ color: 'rgba(74,222,128,0.6)' }}>（本地模型无需填写）</span>}
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={e => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder={selectedPreset === 'ollama' ? '可留空' : 'sk-...'}
                  className="w-full p-3 pr-10 rounded-xl text-sm"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(230,230,250,0.9)',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: 'rgba(200,200,230,0.4)' }}
                >
                  {showApiKey ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* API 地址 */}
            <div>
              <label className="text-xs block mb-1.5" style={{ color: 'rgba(200,200,230,0.5)' }}>
                API 地址
              </label>
              <input
                type="text"
                value={config.baseUrl}
                onChange={e => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://api.deepseek.com/v1"
                className="w-full p-3 rounded-xl text-sm"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(230,230,250,0.9)',
                  outline: 'none',
                }}
              />
            </div>

            {/* 模型名称 */}
            <div>
              <label className="text-xs block mb-1.5" style={{ color: 'rgba(200,200,230,0.5)' }}>
                模型名称
                {selectedPreset === 'doubao' && (
                  <span style={{ color: 'rgba(255,180,100,0.6)', marginLeft: 6, fontSize: '10px' }}>
                    自定义接入点填 ep-xxx 格式
                  </span>
                )}
              </label>
              <input
                type="text"
                value={config.model}
                onChange={e => setConfig(prev => ({ ...prev, model: e.target.value }))}
                placeholder={
                  selectedPreset === 'doubao'
                    ? 'doubao-seed-2.0-lite 或 ep-xxx'
                    : 'deepseek-chat'
                }
                className="w-full p-3 rounded-xl text-sm"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(230,230,250,0.9)',
                  outline: 'none',
                }}
              />
            </div>

            {/* 高级参数 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs block mb-1.5" style={{ color: 'rgba(200,200,230,0.5)' }}>
                  创造性 ({config.temperature.toFixed(1)})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.1"
                  value={config.temperature}
                  onChange={e => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full"
                  style={{ accentColor: 'rgb(139,120,255)' }}
                />
              </div>
              <div>
                <label className="text-xs block mb-1.5" style={{ color: 'rgba(200,200,230,0.5)' }}>
                  最大Token ({config.maxTokens})
                </label>
                <input
                  type="range"
                  min="256"
                  max="2048"
                  step="128"
                  value={config.maxTokens}
                  onChange={e => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  className="w-full"
                  style={{ accentColor: 'rgb(139,120,255)' }}
                />
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="px-5 pb-6 space-y-2">
            {/* 测试连接 + 保存 */}
            <div className="flex gap-2">
              <button
                onClick={handleTest}
                disabled={testing}
                className="flex-1 p-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: testing ? 'rgba(200,200,230,0.4)' : 'rgba(230,230,250,0.8)',
                  cursor: testing ? 'wait' : 'pointer',
                }}
              >
                {testing ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ⏳
                    </motion.span>
                    测试中...
                  </span>
                ) : '🔗 测试连接'}
              </button>
              <button
                onClick={handleSave}
                className="flex-1 p-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: saved
                    ? 'rgba(74,222,128,0.2)'
                    : 'linear-gradient(135deg, rgba(139,120,255,0.6), rgba(100,180,255,0.6))',
                  border: '1px solid rgba(139,120,255,0.3)',
                  color: '#fff',
                }}
              >
                {saved ? '✅ 已保存' : '💾 保存设置'}
              </button>
            </div>

            {/* 测试结果 */}
            <AnimatePresence>
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl text-sm text-center"
                  style={{
                    background: testResult.success
                      ? 'rgba(74,222,128,0.1)'
                      : 'rgba(255,107,107,0.1)',
                    border: `1px solid ${testResult.success ? 'rgba(74,222,128,0.2)' : 'rgba(255,107,107,0.2)'}`,
                    color: testResult.success
                      ? 'rgba(74,222,128,0.9)'
                      : 'rgba(255,107,107,0.9)',
                  }}
                >
                  {testResult.success ? '✅' : '❌'} {testResult.message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 说明 */}
            <div className="pt-2 text-center">
              <p className="text-[10px]" style={{ color: 'rgba(200,200,230,0.25)' }}>
                API Key 仅保存在本地浏览器，不会上传到任何服务器
              </p>
              <p className="text-[10px] mt-1" style={{ color: 'rgba(200,200,230,0.25)' }}>
                未配置 AI 时使用本地规则引擎，所有功能仍可正常使用
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
