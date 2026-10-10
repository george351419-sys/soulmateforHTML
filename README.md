# 生辰造像馆

输入姓名或昵称、生辰、出生地点和性别，在浏览器内排八字与紫微双盘，生成伴侣外貌气质、性格能力、相处特质的传统取象报告。支持下载文字报告。

网站：https://george351419-sys.github.io/soulmateforHTML/

## GitHub Pages 版本

- 出生资料在当前浏览器内计算，不发送到排盘服务器，也不写入历史库。
- 支持公历、农历、闰月、时辰、明确时区及夏令时校正。
- 页面提供明确标记的肖像示例。**实时 AI 生图尚未接通**：GitHub Pages 是静态托管，不能运行私密生图服务端。不会用示例图冒充用户结果。
- 姓名只用于报告称呼。海外出生需手动选择支持的时区；采用标准时，不做经度与真太阳时校正。
- 解读为传统文化取象和艺术想象，不是对真实配偶的外貌、性格、职业或财富预测。

## 本地运行

Node.js 22.13 或更高版本。

```sh
npm ci
npm run dev:pages
```

打开输出中的 `/soulmateforHTML/` 地址。

```sh
npm run build:pages
npm run preview:pages
npx tsc --noEmit
```

## 发布 GitHub Pages

`main` 保存源码，`gh-pages` 保存构建结果。仓库 Settings → Pages 选择 Deploy from a branch，分支 `gh-pages`，目录 `/ (root)`。GitHub 会自动发布该分支的更新。

在已配置本仓库 Git 认证的环境执行：

```sh
git add .
git commit -m "Update website"
git push origin main
npm run deploy:pages
```

发布脚本只把 `dist-pages` 静态结果推送到 `gh-pages`，正常提交不强制覆盖远端历史。调整仓库名称时同步修改 `vite.pages.config.ts` 的 `base`。

## 保留的完整服务端版本

使用完整服务端版本前，先创建 `.openai` 目录，并把 `hosting.example.json` 复制为 `.openai/hosting.json`。`npm run dev` 启动原完整服务端版本，`npm run build` 构建它。`app/api/portrait` 为需要登录的生图接口，需要在受支持的服务器私密配置 `OPENAI_API_KEY` 和可选 `IMAGE_MODEL`。密钥不能放入 Pages、客户端代码或仓库。生图只发送去除姓名、生辰和地点的艺术描述。

`lib/client-api.ts` 是服务端版本适配层；`pages/client-api.ts` 是 Pages 本地计算适配层。两者共享同一个页面和排盘解读算法。

详细来源与口径见 [方法说明](docs/method.md)。紫微算法来源许可证保留于 `lib/ziwei/LICENSE`。项目不包含 API 密钥、用户出生资料历史或本机配置。

## DeepSeek 文字解读

已准备 Vercel/Workers 服务端接口、限流和结构校验。线上启用需要私密设置 `DEEPSEEK_API_KEY`，并在 Pages 构建时设置公开后端地址 `VITE_INTERPRET_API_URL`。没有地址或服务不可用时明确显示基础报告。详细步骤见 [DeepSeek 部署说明](docs/deepseek-setup.md)。DeepSeek 用于文字解读，不生成肖像。
