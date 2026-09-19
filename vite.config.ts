import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve, dirname } from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import { fileURLToPath } from 'url';
import { githubOAuthProxy } from './vite-plugin-github-proxy';
import { googleOAuthProxy } from './vite-plugin-google-proxy';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // 默认部署在站点根路径（Cloudflare Pages / Vercel / Workers Static Assets）。
  // GitHub Pages project site 部署子路径时，由 CI 显式传入 VITE_BASE_PATH=/<repo>/ 覆盖。
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    // GitHub OAuth token 代理（开发环境）
    githubOAuthProxy(),
    // Google OAuth token 代理（开发环境）
    googleOAuthProxy(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.ts', '.json', '.vue']
  },
  server: {
    port: 5174,
    proxy: {
      // Analytics Worker 代理（开发环境）
      '/api/analytics': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  }
});