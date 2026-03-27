/**
 * 语音输入按钮组件 — Phase 2.1
 * 使用 Web Speech Recognition API
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isSpeechRecognitionSupported, createSpeechRecognition } from '../ai-service';

interface VoiceInputProps {
  onResult: (text: string) => void;
  className?: string;
}

export default function VoiceInput({ onResult, className = '' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const supported = isSpeechRecognitionSupported();

  const startListening = useCallback(() => {
    if (!supported) {
      setError('浏览器不支持语音输入');
      return;
    }

    setError(null);
    setInterimText('');

    const recognition = createSpeechRecognition({
      onResult: (text, isFinal) => {
        if (isFinal) {
          onResult(text);
          setInterimText('');
          // 继续监听
        } else {
          setInterimText(text);
        }
      },
      onError: (err) => {
        if (err === 'no-speech') {
          setError('没有检测到语音，请再试一次');
        } else if (err === 'not-allowed') {
          setError('请允许麦克风权限');
        } else {
          setError('语音识别出错');
        }
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
        setInterimText('');
      },
      onStart: () => {
        setIsListening(true);
      },
    });

    if (recognition) {
      recognitionRef.current = recognition;
      recognition.start();
    }
  }, [supported, onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  if (!supported) return null;

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={isListening ? stopListening : startListening}
        className="w-8 h-8 rounded-full flex items-center justify-center relative"
        style={{
          background: isListening
            ? 'linear-gradient(135deg, rgba(255,100,100,0.6), rgba(255,150,100,0.6))'
            : 'rgba(255,255,255,0.08)',
          border: 'none',
          cursor: 'pointer',
          color: isListening ? '#fff' : 'rgba(200,200,230,0.5)',
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            🎤
          </motion.div>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}

        {/* 录音脉冲圈 */}
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ border: '2px solid rgba(255,100,100,0.5)' }}
          />
        )}
      </motion.button>

      {/* 实时文字预览 */}
      <AnimatePresence>
        {(interimText || error) && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg"
            style={{
              background: error ? 'rgba(255,100,100,0.15)' : 'rgba(139,120,255,0.15)',
              border: `1px solid ${error ? 'rgba(255,100,100,0.2)' : 'rgba(139,120,255,0.2)'}`,
              color: error ? 'rgba(255,150,150,0.8)' : 'rgba(200,200,230,0.7)',
              fontSize: '11px',
              maxWidth: '200px',
            }}
          >
            {error || interimText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
