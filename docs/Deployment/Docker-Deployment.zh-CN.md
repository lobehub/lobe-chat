# Docker 部署指引

[![][docker-release-shield]][docker-release-link]
[![][docker-size-shield]][docker-size-link]
[![][docker-pulls-shield]][docker-pulls-link]

我们提供了 [Docker 镜像][docker-release-link]，供你在自己的私有设备上部署 LobeChat 服务

#### TOC

- [安装 Docker 容器环境](#安装-docker-容器环境)
- [部署容器镜像](#部署容器镜像)
  - [`A` 指令部署（推荐）](#a-指令部署推荐)
  - [`B` Docker Compose](#b-docker-compose)

## 安装 Docker 容器环境

如果已安装，请跳过此步

**Ubuntu**

```fish
$ apt install docker.io
```

**CentOS**

```fish
$ yum install docker
```

## 部署容器镜像

### `A` 指令部署（推荐）

使用以下命令即可使用一键启动 LobeChat 服务：

```fish
$ docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e ACCESS_CODE=lobe66 \
  lobehub/lobe-chat
```

> \[!NOTE]
>
> - 默认映射端口为 `3210`, 请确保未被占用或手动更改端口映射
> - 使用你的 OpenAI API Key 替换上述命令中的 `sk-xxxx`
> - 官方 Docker 镜像中设定的密码默认为 `lobe66`，请将其替换为自己的密码以提升安全性
> - LobeChat 支持的完整环境变量列表请参考 [环境变量](https://github.com/lobehub/lobe-chat/wiki/Environment-Variable.zh-CN) 部分

> \[!WARNING]
>
> 注意，当**部署架构与镜像的不一致时**，需要对 **Sharp** 进行交叉编译，详见 [Sharp 交叉编译](https://sharp.pixelplumbing.com/install#cross-platform)

#### 使用代理地址

如果你需要通过代理使用 OpenAI 服务，你可以使用 `OPENAI_PROXY_URL` 环境变量来配置代理地址：

```fish
$ docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e OPENAI_PROXY_URL=https://api-proxy.com/v1 \
  -e ACCESS_CODE=lobe66 \
  lobehub/lobe-chat
```

> \[!NOTE]
>
> 由于官方的 Docker 镜像构建大约需要半小时左右，如果在更新部署后会出现「存在更新」的提示，可以等待镜像构建完成后再次部署。

### `B` Docker Compose

使用 `docker-compose` 时配置文件如下:

```yml
version: '3.8'

services:
  lobe-chat:
    image: lobehub/lobe-chat
    container_name: lobe-chat
    ports:
      - '3210:3210'
    environment:
      OPENAI_API_KEY: sk-xxxx
      OPENAI_PROXY_URL: https://api-proxy.com/v1
      ACCESS_CODE: lobe66
```

[docker-pulls-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-pulls-shield]: https://img.shields.io/docker/pulls/lobehub/lobe-chat?color=45cc11&labelColor=black&style=flat-square
[docker-release-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-release-shield]: https://img.shields.io/docker/v/lobehub/lobe-chat?color=369eff&label=docker&labelColor=black&logo=docker&logoColor=white&style=flat-square
[docker-size-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-size-shield]: https://img.shields.io/docker/image-size/lobehub/lobe-chat?color=369eff&labelColor=black&style=flat-square
