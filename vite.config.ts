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
  // GitHub Pages project site 部署在仓库子路径（https://<user>.github.io/cnote-web/）
  // 若部署到 user/org 主页（仓库名 <user>.github.io）请改为 '/'
  base: '/cnote-web/',
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