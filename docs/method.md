# 排盘与描述方法

紫微核心来自 george351419-sys/ziwei-doushu，版本 79b21babb30a65cdac3ce267f39276ce63debf4b，源文件及 MIT 许可保留于 lib/ziwei。依赖 iztro 2.5.8。
八字使用 lunar-javascript 1.7.3，将本地 lunar-python 的四柱路径移植到 Worker 运行环境；两个对话样例与 Python 引擎逐项核对。没有把完整 Python 大运/神煞渲染器搬到网页。

默认标准时；依所选出生地时区校正夏令时；晚子时 sect=2，紫微 dayDivide=current；闰月 fixLeap=true。不做经度或均时差校正。地点是文字记录，时区由用户选择；不静默地理编码或猜测海外时区。对于无法确认的夏令时重复和不存在的钟点，拒绝排盘。

性格与能力由 lib/interpretations.ts 的规则词库组合；不是语言模型的完整格局分析，不计算喜用神，不声称推断真实职业、收入或心理人格。图片需要站点端生图 API；没有服务密钥时显示未接通，绝不回退示例冒充个人结果。服务仅接收去身份化外形提示词，不发送姓名、生日或出生地点。

来源：
- https://www.suanzhun.net/book/2515.html
- https://docs.iztro.com/learn/major-star
- https://lingtai.cc/zh-CN/guides/ziwei-spouse-palace
- https://www.ziweicn.com/doushugongwei/mingqianzitian/3479.html
- https://www.ydygfs.com/fengshuishangpin/2023/0815/31247.html

这些是传统说法的来源，不是预测准确率证据。页面不提供恋爱、职业或财务决策建议。
