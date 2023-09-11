# Maintaining Updates with LobeChat Self-Deployment

If you have deployed your own project following the one-click deployment steps in the README, you might encounter constant prompts indicating "updates available". This is because Vercel defaults to creating a new project instead of forking this one, resulting in an inability to accurately detect updates. We suggest you redeploy using the following steps:

- Remove the original repository;
- Use the <kbd>Fork</kbd> button at the top right corner of the page to fork this project;
- Re-select and deploy on `Vercel`.

## Enabling Automatic Updates

> **👉🏻 Note：** If you encounter an error executing Upstream Sync, manually Sync Fork once

Once you have forked the project, due to Github restrictions, you will need to manually enable Workflows on the Actions page of your forked project and activate the Upstream Sync Action. Once enabled, you can set up hourly automatic updates.

![](https://gw.alipayobjects.com/zos/kitchen/kYpSH6v%26iC/sync-1.webp)

![](https://gw.alipayobjects.com/zos/kitchen/gUQaz%24mGkS/sync-2.webp)
