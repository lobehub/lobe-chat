# Docker Deployment Guide

[![][docker-release-shield]][docker-release-link]
[![][docker-size-shield]][docker-size-link]
[![][docker-pulls-shield]][docker-pulls-link]

We provide [Docker Images][docker-release-link] for you to deploy LobeChat service on your private device.

#### TOC

- [Install Docker container environment](#install-docker-container-environment)
- [Deploy container image](#deploy-container-image)
  - [`A` Command deployment (recommended)](#a-command-deployment-recommended)
  - [`B` Docker Compose](#b-docker-compose)

## Install Docker container environment

If already installed, skip this step.

**Ubuntu:**

```fish
$ apt install docker.io
```

**CentOS:**

```fish
$ yum install docker
```

## Deploy container image

### `A` Command deployment (recommended)

Use the following command to start LobeChat service with one click:

```fish
$ docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e ACCESS_CODE=lobe66 \
  lobehub/lobe-chat
```

> \[!NOTE]
>
> - The default mapped port is `3210`. Make sure it is not occupied or manually change the port mapping.
> - Replace `sk-xxxx` in the above command with your own OpenAI API Key.
> - The password set in the official Docker image is `lobe66` by default. Replace it with your own password to improve security.
> - For a complete list of environment variables supported by LobeChat, please refer to the [Environment Variables](https://github.com/lobehub/lobe-chat/wiki/Environment-Variable.zh-CN) section.

> \[!WARNING]
>
> If the architecture of your **deployed server differs from the container architecture**, you may need to perform cross-compilation for **Sharp**. For further details, please refer to the documentation on [Sharp Cross-platform](https://sharp.pixelplumbing.com/install#cross-platform).

#### Use a proxy address

If you need to use OpenAI service through a proxy, you can use the `OPENAI_PROXY_URL` environment variable to configure the proxy address:

```fish
$ docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e OPENAI_PROXY_URL=https://api-proxy.com/v1 \
  -e ACCESS_CODE=lobe66 \
  lobehub/lobe-chat
```

> \[!NOTE]
>
> As the official Docker image build takes about half an hour, if there is a "update available" prompt after updating deployment, wait for the image to finish building before deploying again.

### `B` Docker Compose

The configuration file for using `docker-compose` is as follows:

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

<!-- LINK GROUP -->

[docker-pulls-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-pulls-shield]: https://img.shields.io/docker/pulls/lobehub/lobe-chat?color=45cc11&labelColor=black&style=flat-square
[docker-release-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-release-shield]: https://img.shields.io/docker/v/lobehub/lobe-chat?color=369eff&label=docker&labelColor=black&logo=docker&logoColor=white&style=flat-square
[docker-size-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-size-shield]: https://img.shields.io/docker/image-size/lobehub/lobe-chat?color=369eff&labelColor=black&style=flat-square
