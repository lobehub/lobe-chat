# 使用 Docker 部署

[![][docker-release-shield]][docker-release-link]

我们提供了 Docker 镜像，供你在自己的私有设备上部署 LobeChat 服务。

## 容器镜像

### 指令部署 （推荐）

使用以下命令即可使用一键启动 LobeChat 服务：

```shell
docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e ACCESS_CODE=lobe66 \
  lobehub/lobe-chat
```

### 使用代理地址

如果你需要通过代理使用 OpenAI 服务，你可以使用 `OPENAI_PROXY_URL` 环境变量来配置代理地址：

```shell
docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e OPENAI_PROXY_URL=https://api-proxy.com/v1 \
  -e ACCESS_CODE=lobe66 \
  lobehub/lobe-chat
```

LobeChat 完整的环境变量请参考 [环境变量](./Environment-Variable.zh-CN.md) 部分。

> **Note**\
> 由于官方的 Docker 镜像构建大约需要半小时左右，如果在更新部署后会出现「存在更新」的提示，可以等待镜像构建完成后再次部署。

### 🚧 Docker Compose

施工中，请耐心等待～

[docker-release-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-release-shield]: https://img.shields.io/docker/v/lobehub/lobe-chat?color=369eff&label=docker&labelColor=black&logo=docker&logoColor=white&style=flat-square
