# Upstream Sync

English | [简体中文](https://github.com/lobehub/lobe-chat/wiki/Upstream-Sync.zh-CN)

## `A` Vercel / Zeabur Deployment

If you have deployed your own project following the one-click deployment steps in the README, you might encounter constant prompts indicating "updates available". This is because Vercel defaults to creating a new project instead of forking this one, resulting in an inability to accurately detect updates. We suggest you redeploy using the following steps:

- Remove the original repository;
- Use the <kbd>Fork</kbd> button at the top right corner of the page to fork this project;
- Re-select and deploy on `Vercel`.

## Enabling Automatic Updates

> \[!NOTE]
>
> If you encounter an error executing Upstream Sync, manually Sync Fork once

Once you have forked the project, due to Github restrictions, you will need to manually enable Workflows on the Actions page of your forked project and activate the Upstream Sync Action. Once enabled, you can set up hourly automatic updates.

![](https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/266985117-4d48fe7b-0412-4667-8129-b25ebcf2c9de.png)
![](https://github-production-user-asset-6210df.s3.amazonaws.com/17870709/266985177-7677b4ce-c348-4145-9f60-829d448d5be6.png)

## `B` Docker Deployment

Upgrading the Docker deployment version is very simple, just redeploy the latest image of LobeChat. Here are the instructions to perform these steps:

1. Stop and delete the currently running LobeChat container (assuming the name of the LobeChat container is `lobe-chat`):

```fish
docker stop lobe-chat
docker rm lobe-chat
```

2. Pull the latest Docker image of LobeChat:

```fish
docker pull lobehub/lobe-chat
```

3. Redeploy the LobeChat container using the newly pulled image:

```fish
docker run -d -p 3210:3210 \
  -e OPENAI_API_KEY=sk-xxxx \
  -e OPENAI_PROXY_URL=https://api-proxy.com/v1 \
  -e ACCESS_CODE=lobe66 \
  --name lobe-chat \
  lobehub/lobe-chat
```

Make sure you have sufficient permissions to stop and delete the container before executing these commands, and Docker has sufficient permissions to pull the new image.

> \[!NOTE]
>
> If I redeploy, will my local chat history be lost?
>
> Don't worry, all of LobeChat's chat history is stored in your local browser. Therefore, when you redeploy LobeChat using Docker, your chat history will not be lost.
