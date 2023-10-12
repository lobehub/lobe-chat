# Deployment using Docker

[![][docker-release-shield]][docker-release-link]

We provide Docker images for deploying the LobeChat service on your own private devices.

## Container Image

### Command Deployment (Recommended)

Use the following command to start the LobeChat service with one-click:

```shell
docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e ACCESS_CODE=lobe66 \
  lobehub/lobe-chat
```

### Using Proxy Address

If you need to use OpenAI services through a proxy, you can configure the proxy address using the `OPENAI_PROXY_URL` environment variable:

```shell
docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e OPENAI_PROXY_URL=https://api-proxy.com/v1 \
  -e ACCESS_CODE=lobe66 \
  lobehub/lobe-chat
```

For a complete list of environment variables for LobeChat, please refer to the [Environment Variables](./Environment-Variable.md) section.

> **Note**\
> Since the official Docker image construction takes about half an hour, if you see the "update available" message after updating the deployment, you can wait for the image construction to complete before redeploying.

### 🚧 Docker Compose

Under construction, please be patient\~

[docker-release-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-release-shield]: https://img.shields.io/docker/v/lobehub/lobe-chat?color=369eff&label=docker&labelColor=black&logo=docker&logoColor=white&style=flat-square
