# DeepSeek 后端部署

GitHub Pages 仅保存前端和公开的后端 URL。密钥只放在服务器的 `DEEPSEEK_API_KEY` 环境变量，不能使用 `VITE_` 前缀，不能写入 Git。

## Vercel（已有账号）

1. 导入这个 GitHub 仓库，根目录使用仓库根目录；`vercel.json` 已配置 `/api/interpret` 与 `/interpret`。
2. 在 Vercel 项目 Settings → Environment Variables 添加 `DEEPSEEK_API_KEY`（Secret）、`DEEPSEEK_MODEL=deepseek-flash`、`ALLOWED_ORIGINS=https://george351419-sys.github.io`。
3. 部署后，GitHub Pages 构建环境设置 `VITE_INTERPRET_API_URL=https://你的项目.vercel.app`，重新执行 `npm run deploy:pages`。这里只是公开地址，不能填密钥。

Vercel 在此只承担 API；主要页面仍由 GitHub Pages 托管。模型名称可按账号支持情况调整。后端发送四柱、夫妻宫主星与规则摘要，不发送姓名、生日原文、出生地点。应用不主动保存请求，平台仍可能保存访问元数据。

当前 Vercel 适配器提供单实例每来源地址每分钟 3 次、每实例每分钟 30 次的基础限流；多实例不共享计数，CORS 也不是身份认证或费用硬上限。公开推广前应在 Vercel Firewall 配置限流和账户预算控制。

## Cloudflare Workers（可选）

`npx wrangler login`，使用 `npx wrangler secret put DEEPSEEK_API_KEY --config backend/wrangler.jsonc` 安全输入密钥，然后 `npx wrangler deploy --config backend/wrangler.jsonc`。前端变量设置为返回的 Worker 地址。配置的限流是每个 Cloudflare 位置的近似限流，不是全局费用上限。

## 验证

`node tests/deepseek.mjs` 使用模拟响应验证协议与异常处理，不使用真实密钥、不产生 API 费用。实际服务连通性必须在配置服务端密钥之后单独验证。没有后端地址时页面只生成基础报告；后端失败会明确提示基础报告回退，不冒充 DeepSeek 结果。

API 文档：https://api-docs.deepseek.com/api/create-chat-completion/
