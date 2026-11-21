---
name: git-save
description: 用 git 暂存、提交并推送到远程仓库（存档）；自动生成提交信息，内置敏感文件拦截与提交前预览。
---

# Git 存档推送技能

用于：把当前改动存档（`git commit`）并推送到远程仓库。提交信息自动总结。

## 执行步骤
1. **看状态**：`git status --short` 与 `git diff --stat`，了解有哪些改动。
2. **敏感文件检查**：若暂存内容包含 `.env`、`credentials`、`*.pem`、`.claude/settings.local.json` 等含密钥/凭据的文件，**立即停止并警告**，不提交这些文件。
3. **暂存**：`git add -A`。
4. **预览**：列出即将提交的文件清单，再次确认无敏感文件。
5. **生成提交信息**：根据改动内容用 conventional 格式概括——`feat:` 新功能、`fix:` 修复、`chore:` 杂项、`docs:` 文档、`refactor:` 重构，一句话中文；改动过杂时用 `chore: 本次整体改动`。
6. **提交**：`git commit -m "<信息>"`，提交信息末尾追加一行：
   ```
   Co-Authored-By: Claude Code <noreply@anthropic.com>
   ```
7. **推送**：`git push`；若当前分支无上游（首次推送）则 `git push -u origin <当前分支>`；若未配置远程仓库，停止并提示 `git remote add origin <url>`。

## 硬性约束
- 仅在用户明确要求「存档 / 提交 / 推送」时执行，不擅自提交。
- 敏感文件（密钥 / 凭据）绝不提交，发现即停并提示。
- 提交信息用简洁中文。

## 成功标准
- 提交成功且信息清晰；
- 推送成功，或明确提示「未配置远程 / 需首次 set-upstream」；
- 无密钥 / 凭据文件被误提交。
