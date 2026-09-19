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
  // GitHub Pages project site 部署在仓库子路径（https://<user>.github.io/<repo>/）
  // 优先读取 CI 传入的仓库名（见 .github/workflows/deploy.yml 的 VITE_BASE_PATH），
  // 本地/未传入时回退到 'cnote-web'。若改仓库名，更新此默认值或依赖 CI 注入即可。
  base: process.env.VITE_BASE_PATH || '/cnote-web/',
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