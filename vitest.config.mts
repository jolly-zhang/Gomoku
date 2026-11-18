import { defineConfig } from 'vitest/config';

// 仅对核心规则层（纯 TS、无 React/RN 依赖）跑单元测试。
// 核心层内部使用相对路径导入，因此无需配置 @ 别名。
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/core/**/*.test.ts'],
  },
});
