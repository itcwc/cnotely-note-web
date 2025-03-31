
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import vue from '@vitejs/plugin-vue';
import { resolve, dirname } from 'path';
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// 手动定义 __dirname，因为在 ES 模块中默认是没有的
// const __dirname = new URL('.', import.meta.url).pathname;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // 将 @ 映射到 src 目录
    },
    extensions: ['.ts', '.json', '.ts']
  },
  root: resolve(__dirname, "./"),
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "index.html"), // 插件弹窗
        background: resolve(__dirname, "src/background.ts"), // 后台脚本
        content: resolve(__dirname, "src/content.ts") // 内容脚本
      },
      output: {
        entryFileNames: "[name].js"
      }
    }
  }
});
