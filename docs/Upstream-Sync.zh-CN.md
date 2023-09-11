# LobeChat 自部署保持更新

如果你根据 README 中的一键部署步骤部署了自己的项目，你可能会发现总是被提示“有可用更新”。这是因为 Vercel 默认为你创建新项目而非 fork 本项目，这将导致无法准确检测更新。我们建议按照以下步骤重新部署：

- 删除原有的仓库；
- 使用页面右上角的 <kbd>Fork</kbd> 按钮，Fork 本项目；
- 在 `Vercel` 上重新选择并部署。

## 启动自动更新

> **👉🏻 提示：** 如果你在执行 `Upstream Sync` 时遇到错误，请手动执再行一次

当你 Fork 了项目后，由于 Github 的限制，你需要手动在你 Fork 的项目的 Actions 页面启用 Workflows，并启动 Upstream Sync Action。启用后，你可以设置每小时进行一次自动更新。

![](https://gw.alipayobjects.com/zos/kitchen/kYpSH6v%26iC/sync-1.webp)

![](https://gw.alipayobjects.com/zos/kitchen/gUQaz%24mGkS/sync-2.webp)
