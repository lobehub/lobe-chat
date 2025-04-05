/**
 * Generate PR comment with download links for desktop builds
 */
module.exports = async ({ github, context, releaseUrl, version, tag }) => {
  try {
    // Get release assets to create download links
    const release = await github.rest.repos.getReleaseByTag({
      owner: context.repo.owner,
      repo: context.repo.repo,
      tag,
    });

    // Organize assets by platform
    const macAssets = release.data.assets.filter(
      (asset) =>
        ((asset.name.includes('.dmg') || asset.name.includes('.zip')) &&
          !asset.name.includes('.blockmap')) ||
        (asset.name.includes('latest-mac') && asset.name.endsWith('.yml')),
    );

    const winAssets = release.data.assets.filter(
      (asset) =>
        (asset.name.includes('.exe') && !asset.name.includes('.blockmap')) ||
        (asset.name.includes('latest-win') && asset.name.endsWith('.yml')),
    );

    const linuxAssets = release.data.assets.filter(
      (asset) =>
        (asset.name.includes('.AppImage') && !asset.name.includes('.blockmap')) ||
        (asset.name.includes('latest-linux') && asset.name.endsWith('.yml')),
    );

    // Generate combined download table
    let assetTable = '| Platform | File | Size |\n| --- | --- | --- |\n';

    // Add macOS assets
    macAssets.forEach((asset) => {
      const sizeInMB = (asset.size / (1024 * 1024)).toFixed(2);
      assetTable += `| macOS | [${asset.name}](${asset.browser_download_url}) | ${sizeInMB} MB |\n`;
    });

    // Add Windows assets
    winAssets.forEach((asset) => {
      const sizeInMB = (asset.size / (1024 * 1024)).toFixed(2);
      assetTable += `| Windows | [${asset.name}](${asset.browser_download_url}) | ${sizeInMB} MB |\n`;
    });

    // Add Linux assets
    linuxAssets.forEach((asset) => {
      const sizeInMB = (asset.size / (1024 * 1024)).toFixed(2);
      assetTable += `| Linux | [${asset.name}](${asset.browser_download_url}) | ${sizeInMB} MB |\n`;
    });

    return `### 🚀 Desktop App Build Completed!

**Version**: \`${version}\`

📦 [View All Build Artifacts](${releaseUrl})


## Build Artifacts

${assetTable}

> [!Warning]
>
> Note: This is a temporary build for testing purposes only.`;
  } catch (error) {
    console.error('Error generating PR comment:', error);
    // Fallback to a simple comment if error occurs
    return `
### 🚀 Desktop App Build Completed!

**Version**: \`${version}\`

## 📦 [View All Build Artifacts](${releaseUrl})

> Note: This is a temporary build for testing purposes only.
    `;
  }
};
