import semver from 'semver';

/**
 * 判断是否需要应用更新而非仅渲染层更新
 * @param currentVersion 当前版本
 * @param nextVersion 新版本
 * @returns 是否需要应用更新
 */
export const shouldUpdateApp = (currentVersion: string, nextVersion: string): boolean => {
  // 如果版本号包含 .app 后缀，强制进行应用更新
  if (nextVersion.includes('.app')) {
    return true;
  }

  try {
    // 解析版本号
    const current = semver.parse(currentVersion);
    const next = semver.parse(nextVersion);

    if (!current || !next) return true;

    // 主版本号或次版本号变更时，需要进行应用更新
    if (current.major !== next.major || current.minor !== next.minor) {
      return true;
    }

    // 仅修订版本号变更，优先进行渲染层热更新
    return false;
  } catch {
    // 解析失败时，默认进行应用更新
    return true;
  }
};
