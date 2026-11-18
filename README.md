# 五子棋 Gomoku

一款 iPad 优先、支持黑棋禁手（三三 / 四四 / 长连）的双人同屏五子棋，基于 **Expo + React Native + TypeScript**，可导出静态站点部署到 **Vercel**。

## 功能

- 15×15 标准棋盘，黑棋先行
- 黑棋禁手判定：三三、四四、长连（触发时禁止落子并弹窗提示）
- 落子 / 胜负判定 / 平局判定
- 悔棋（单步）、重新开始
- 最后一手高亮标记、终局锁定
- 双人同屏对战，横屏 / 竖屏自适应

## 技术栈

- Expo SDK 58（expo-router 文件路由）
- React Native 0.88 + TypeScript
- react-native-svg 矢量绘制棋盘
- vitest 单元测试（核心规则层）

## 环境要求

- **Node.js ≥ 22.13**（推荐 22 LTS 或 24）。SDK 58 的 Metro 需要 Node 22+，请勿使用 Node 20。
- 本地调试：iPad 安装 Expo Go，并与电脑处于同一局域网。

## 本地调试（Expo Go）

```bash
nvm use           # 切换到 .nvmrc 指定的 Node 22（未安装则 nvm install 22）
npm install
npx expo start
```

用 iPad 上的 Expo Go 扫描终端二维码即可预览。

> 本项目不执行 `expo run:ios`、不生成 Swift/SwiftUI、不涉及 Xcode、不需要苹果开发者账号。

## 测试与类型检查

```bash
npm test            # 核心规则层单元测试（vitest）
npm run typecheck   # TypeScript 类型检查
```

## Web 导出

```bash
npm run export:web
# 等价于：npx expo export --platform web --output-dir web-build
```

产物输出到 `web-build/` 目录（静态资源，含 SPA `index.html` 与 `_expo/` 资源）。

## 部署到 Vercel

1. 将项目推送到 Git 仓库（GitHub / GitLab / Bitbucket）。
2. 在 Vercel 控制台 **Add New Project** 导入该仓库。
3. 框架选择 **Other**（或自动识别均可）；`vercel.json` 已写好构建命令与输出目录，无需额外配置。
4. 此后每次 `git push` 会自动触发构建并发布。

`vercel.json` 说明：

- `buildCommand: npm run export:web` —— 导出静态资源到 `web-build/`。
- `outputDirectory: web-build` —— Vercel 部署该目录。
- `rewrites` —— 将无后缀路由（如 `/game`）回退到 `index.html`，解决 SPA 刷新 404。

## 目录结构

```
src/
  app/           # expo-router 路由：index 对局单页（打开即对局）
  core/          # 纯逻辑（无 UI 依赖）：类型 / 棋盘 / 规则（禁手+胜负）/ 状态机 + 单测
  components/    # 棋盘、控制面板、禁手弹窗
  hooks/         # useGame 等
  theme.ts       # 配色与尺寸
  haptics.ts     # 触觉反馈（web 自动跳过）
```

## 禁手规则说明

- **三三禁手**：黑棋一子同时形成两个及以上「活三」。
- **四四禁手**：黑棋一子同时形成两个及以上「四」（活四或冲四）。
- **长连禁手**：黑棋一子形成 6 个及以上连子。
- **四三**（一个四 + 一个活三）为必胜手，不算禁手；成五直接获胜。
- 白棋无禁手。
