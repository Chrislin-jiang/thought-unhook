import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

/**
 * LLM API 代理插件
 * 前端请求 /api/llm-proxy，由服务端代理到目标 LLM API
 * 解决浏览器 CORS 跨域限制
 * 
 * 注意：configureServer 直接注册中间件（不 return 函数）
 * 确保在 Vite 内部中间件（SPA fallback 等）之前执行
 */
function llmProxyPlugin(): Plugin {
  return {
    name: 'llm-proxy',
    configureServer(server) {
      // 直接在 server.middlewares 上注册（在 Vite 内部中间件之前）
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        // 只拦截 /api/llm-proxy 路径
        if (!req.url?.startsWith('/api/llm-proxy')) {
          return next();
        }

        // 只接受 POST
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        // 读取请求体
        let rawBody = '';
        req.on('data', (chunk: string | Buffer) => {
          rawBody += typeof chunk === 'string' ? chunk : chunk.toString('utf-8');
        });
        req.on('end', async () => {
          let parsed: { targetUrl?: string; headers?: Record<string, string>; body?: unknown };
          try {
            parsed = JSON.parse(rawBody);
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON body' }));
            return;
          }

          const { targetUrl, headers = {}, body } = parsed;
          if (!targetUrl) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing targetUrl' }));
            return;
          }

          console.log(`[LLM Proxy] → ${targetUrl}`);

          try {
            const proxyRes = await fetch(targetUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...headers,
              },
              body: JSON.stringify(body),
            });

            const responseText = await proxyRes.text();
            console.log(`[LLM Proxy] ← ${proxyRes.status} (${responseText.length} bytes)`);

            res.statusCode = proxyRes.status;
            res.setHeader('Content-Type', proxyRes.headers.get('content-type') || 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(responseText);
          } catch (err: unknown) {
            console.error('[LLM Proxy] Error:', err);
            res.statusCode = 502;
            res.end(JSON.stringify({
              error: 'Proxy request failed',
              detail: err instanceof Error ? err.message : String(err),
            }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), llmProxyPlugin()],
  server: {
    port: 5173,
    host: true,
  },
})
