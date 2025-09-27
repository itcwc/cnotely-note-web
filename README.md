# cnotely - 网页版 Markdown 编辑器

## 项目简介

cnotely 是一个基于 Vue 3 + TypeScript + Vite 构建的现代化 Markdown 笔记工具，提供了丰富的编辑功能和多种导出选项，支持多语言界面。

## 技术栈

- **前端框架**: Vue 3 + Composition API
- **编程语言**: TypeScript
- **构建工具**: Vite
- **路由管理**: Vue Router
- **国际化**: Vue I18n
- **Markdown 编辑**: editor.md
- **样式支持**: 支持明暗主题切换

## 功能特性

### 编辑功能

- 实时预览 Markdown 内容
- 丰富的工具栏和快捷键支持
- 多主题支持（暗色/亮色模式）
- 编辑器主题自定义

### 导出功能

- 导出为多种格式：
  - Markdown (.md)
  - PDF (.pdf)
  - HTML (.html)
  - Word (.docx)
  - 纯文本 (.txt)
- HTML 导出支持多种主题样式

### 其他特性

- 云存储支持
- 多语言界面（中文/英文）
- 浏览器扩展版本支持（Chrome/Edge/Firefox）
- 响应式设计，适配不同设备

## 浏览器扩展支持

- Chrome (v0.8+)
- Edge (v0.8+)
- Firefox (v0.68)

## 安装与运行

### 环境要求

- Node.js 16.x 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. 克隆项目

```bash
git clone <repository-url>
cd cnotely
```

1. 安装依赖

```bash
npm install
# 或
yarn install
```

1. 开发模式运行

```bash
npm run dev
# 或
yarn dev
```

1. 构建生产版本

```bash
npm run build
# 或
yarn build
```

## 项目结构

```
cnotely/
├── public/            # 静态资源
│   ├── libs/          # 第三方库
│   │   └── editor.md/ # Markdown 编辑器库
│   └── *.css          # 主题样式文件
├── src/               # 源代码
│   ├── assets/        # 项目资源
│   ├── components/    # 组件
│   ├── locales/       # 国际化语言文件
│   ├── router/        # 路由配置
│   ├── views/         # 页面视图
│   ├── App.vue        # 根组件
│   ├── i18n.ts        # 国际化配置
│   ├── main.ts        # 入口文件
│   └── style.css      # 全局样式
├── utils/             # 工具函数
└── vite.config.ts     # Vite 配置
```

## 使用说明

### 创建新笔记

- 访问首页，自动创建未命名笔记
- 点击标题区域可编辑笔记名称

### 编辑内容

- 使用工具栏或 Markdown 语法进行编辑
- 支持实时预览

### 导出笔记

- 点击底部工具栏的导出按钮
- 选择需要的导出格式
- 对于 HTML 导出，可选择主题样式

### 保存到云端

- 登录后可使用云存储功能
- 点击保存按钮将内容同步到云端

### 切换语言

- 在设置页面可选择界面语言
- 支持中文和英文界面

## 配置说明

### 编辑器配置

可在代码中调整编辑器的配置选项，包括工具栏、主题、插件等设置。

### 主题设置

支持切换编辑器主题、预览区域主题和整体应用主题。

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 许可证

MIT License