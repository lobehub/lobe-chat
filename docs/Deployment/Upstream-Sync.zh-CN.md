# 自部署保持更新

## TOC

- [`A` Vercel\`\` / Zeabur 部署](#a-vercel--zeabur-部署)
  - [启动自动更新](#启动自动更新)
- [`B` Docker 部署](#b-docker-部署)

## `A` Vercel\`\` / Zeabur 部署

如果你根据 README 中的一键部署步骤部署了自己的项目，你可能会发现总是被提示 “有可用更新”。这是因为 Vercel 默认为你创建新项目而非 fork 本项目，这将导致无法准确检测更新。我们建议按照以下步骤重新部署：

- 删除原有的仓库；
- 使用页面右上角的 <kbd>Fork</kbd> 按钮，Fork 本项目；
- 在 `Vercel` 上重新选择并部署。

### 启动自动更新

> \[!NOTE]
>
> 如果你在执行 `Upstream Sync` 时遇到错误，请手动执再行一次

当你 Fork 了项目后，由于 Github 的限制，你需要手动在你 Fork 的项目的 Actions 页面启用 Workflows，并启动 Upstream Sync Action。启用后，你可以设置每小时进行一次自动更新。

![](https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/266985117-4d48fe7b-0412-4667-8129-b25ebcf2c9de.png)
![](https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/266985177-7677b4ce-c348-4145-9f60-829d448d5be6.png)

## `B` Docker 部署

Docker 部署版本的升级非常简单，只需要重新部署 LobeChat 的最新镜像即可。 以下是执行这些步骤所需的指令：

1. 停止并删除当前运行的 LobeChat 容器（假设 LobeChat 容器的名称是 `lobe-chat`）：

```fish
docker stop lobe-chat
docker rm lobe-chat
```

2. 拉取 LobeChat 的最新 Docker 镜像：

```fish
docker pull lobehub/lobe-chat
```

3. 使用新拉取的镜像重新部署 LobeChat 容器：

```fish
docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e OPENAI_PROXY_URL=https://api-proxy.com/v1 \
  -e ACCESS_CODE=lobe66 \
  --name lobe-chat \
  lobehub/lobe-chat
```

确保在执行这些命令之前，您有足够的权限来停止和删除容器，并且 Docker 有足够的权限来拉取新的镜像。

> \[!NOTE]
>
> 重新部署的话，我本地的聊天记录会丢失吗？
>
> 放心，LobeChat 的聊天记录全部都存储在你的本地浏览器中。因此使用 Docker 重新部署 LobeChat 时，你的聊天记录并不会丢失。
