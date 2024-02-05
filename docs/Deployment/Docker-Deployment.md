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
  --name lobe-chat \
  lobehub/lobe-chat
```

> \[!NOTE]
>
> - The default mapped port is `3210`. Make sure it is not occupied or manually change the port mapping.
> - Replace `sk-xxxx` in the above command with your own OpenAI API Key.
> - The official Docker doesn't set password by default. Please add your own password to improve security.
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
  --name lobe-chat \
  lobehub/lobe-chat
```

> \[!NOTE]
>
> As the official Docker image build takes about half an hour, if there is a "update available" prompt after updating deployment, wait for the image to finish building before deploying again.

#### Crontab Auto-Update Script

If you want to automatically get the latest images, you can do the following.

First, create a `lobe.env` configuration file with various environment variables, for example:

```env
OPENAI_API_KEY=sk-xxxx
OPENAI_PROXY_URL=https://api-proxy.com/v1
ACCESS_CODE=arthals2333
CUSTOM_MODELS=-gpt-4,-gpt-4-32k,-gpt-3.5-turbo-16k,gpt-3.5-turbo-1106=gpt-3.5-turbo-16k,gpt-4-0125-preview=gpt-4-turbo,gpt-4-vision-preview=gpt-4-vision
```

Then, you can use the following script to automatically update:

```bash
#!/bin/bash
# auto-update-lobe-chat.sh

# Set proxy (optional)
export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890

# Pull the latest image and store the output in a variable
output=$(docker pull lobehub/lobe-chat:latest 2>&1)

# Check if the pull command executed successfully
if [ $? -ne 0 ]; then
  exit 1
fi

# Check if the output contains a specific string
echo "$output" | grep -q "Image is up to date for lobehub/lobe-chat:latest"

# If the image is already up to date, then do nothing
if [ $? -eq 0 ]; then
  exit 0
fi

echo "Detected Lobe-Chat update"

# Remove old container
echo "Removed: $(docker rm -f Lobe-Chat)"

# Run new container
echo "Started: $(docker run -d --network=host --env-file /path/to/lobe.env --name=Lobe-Chat --restart=always lobehub/lobe-chat)"

# Print the update time and version
echo "Update time: $(date)"
echo "Version: $(docker inspect lobehub/lobe-chat:latest | grep 'org.opencontainers.image.version' | awk -F'"' '{print $4}')"

# Clean up unused images
docker images | grep 'lobehub/lobe-chat' | grep -v 'latest' | awk '{print $3}' | xargs -r docker rmi > /dev/null 2>&1
echo "Removed old images."
```

This script can be used in Crontab, but make sure your Crontab can find the correct Docker command. It's recommended to use absolute paths.

Configure Crontab to execute the script every 5 minutes:

```bash
*/5 * * * * /path/to/auto-update-lobe-chat.sh >> /path/to/auto-update-lobe-chat.log 2>&1
```

### `B` Docker Compose

The configuration file for using `docker-compose` is as follows:

```yml
version: '3.8'

services:
  lobe-chat:
    image: lobehub/lobe-chat
    container_name: lobe-chat
    restart: always
    ports:
      - '3210:3210'
    environment:
      OPENAI_API_KEY: sk-xxxx
      OPENAI_PROXY_URL: https://api-proxy.com/v1
      ACCESS_CODE: lobe66
```

#### Crontab Auto-Update Script

Similarly, you can use the following script to update Lobe Chat automatically. When using `Docker Compose`, environment variables do not need additional configuration.

```bash
#!/bin/bash
# auto-update-lobe-chat.sh

# Set proxy (optional)
export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7890

# Pull the latest image and store the output in a variable
output=$(docker pull lobehub/lobe-chat:latest 2>&1)

# Check if the pull command executed successfully
if [ $? -ne 0 ]; then
  exit 1
fi

# Check if the output contains a specific string
echo "$output" | grep -q "Image is up to date for lobehub/lobe-chat:latest"

# If the image is already up to date, then do nothing
if [ $? -eq 0 ]; then
  exit 0
fi

echo "Detected Lobe-Chat update"

# Remove old container
echo "Removed: $(docker rm -f Lobe-Chat)"

# Maybe you need to enter the directory where `docker-compose.yml` is located first
# cd /path/to/docker-compose-folder

# Run new container
echo "Started: $(docker-compose up)"

# Print the update time and version
echo "Update time: $(date)"
echo "Version: $(docker inspect lobehub/lobe-chat:latest | grep 'org.opencontainers.image.version' | awk -F'"' '{print $4}')"

# Clean up unused images
docker images | grep 'lobehub/lobe-chat' | grep -v 'latest' | awk '{print $3}' | xargs -r docker rmi > /dev/null 2>&1
echo "Removed old images."
```

This script can also be used in Crontab, but make sure your Crontab can find the correct Docker command. It's recommended to use absolute paths.

Configure Crontab to execute the script every 5 minutes:

```bash
*/5 * * * * /path/to/auto-update-lobe-chat.sh >> /path/to/auto-update-lobe-chat.log 2>&1
```

<!-- LINK GROUP -->

[docker-pulls-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-pulls-shield]: https://img.shields.io/docker/pulls/lobehub/lobe-chat?color=45cc11&labelColor=black&style=flat-square
[docker-release-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-release-shield]: https://img.shields.io/docker/v/lobehub/lobe-chat?color=369eff&label=docker&labelColor=black&logo=docker&logoColor=white&style=flat-square
[docker-size-link]: https://hub.docker.com/r/lobehub/lobe-chat
[docker-size-shield]: https://img.shields.io/docker/image-size/lobehub/lobe-chat?color=369eff&labelColor=black&style=flat-square
