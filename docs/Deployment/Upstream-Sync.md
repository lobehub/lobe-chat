# Maintaining Updates with LobeChat Self-Deployment

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
