# ARCHIVED — note-app-web → cnote-web

本目录是 `note-app-web`（网页版笔记编辑器）的**本地归档副本**，已于 **2026-09-07** 从 `E:\www\cnote-new\note-app-web` 移入 `_archive/note-app-web`。

## 归档原因
用户决定将该项目**开源并归档**，本地代码库移入归档目录，GitHub 仓库（`itcwc/cnote-web`）转为 Public 作为开源公开仓库。

## 开源状态
- GitHub 仓库：`git@github.com:itcwc/cnote-web.git`（**origin**，仍指向远程）
- 最新提交：`304e59f` — `docs: 开源整理 README、LICENSE 与首页截图`
- 仓库可见性：**Public**（需在 GitHub 网页手动切换）
- 许可证：MIT（`./LICENSE`）
- 首页截图：`./docs/screenshot-home.png`

## 归档变更
1. **README.md** 重写：项目介绍 / 功能特性 / 技术栈 / 安装 / 环境变量 / 项目结构 / 许可证
2. **LICENSE** 新增 MIT 许可
3. **package.json** 增加 `description` / `license` / `author` 元数据
4. `docs/screenshot-home.png` 首页截图（本地运行截图）

## 清理内容
- 已删除：`node_modules`（458MB）、`dist`（3MB），归档后目录约 **8MB**
- 保留：全部源码、配置、`.git` 仓库（含历史，5.2MB）、`.env*` 本地环境变量

## 恢复运行
```bash
cd _archive/note-app-web
npm install
npm run dev   # 默认 http://localhost:5174
```

## 注意事项
- `.env*` 含本地 OAuth 配置（`GITHUB_CLIENT_SECRET` 等），**勿提交远程**（已 gitignore）。
- 远程关联仍指向 `itcwc/cnote-web`；如需继续推送在此目录执行 git 命令即可。
- note-plugin / card-app 中仅有个别注释提及 note-app-web，**无真实构建依赖**，移除后不影响其构建。
