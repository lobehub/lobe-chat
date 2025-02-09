const { execSync } = require('node:child_process');

// 获取当前分支名
const branchName = process.env.VERCEL_GIT_COMMIT_REF || '';

function shouldProceedBuild() {
  // 如果是 lighthouse 分支或以 testgru 开头的分支，取消构建
  if (branchName === 'lighthouse' || branchName.startsWith('testgru')) {
    return false;
  }

  try {
    // 检查文件变更，排除特定文件和目录
    const diffCommand =
      'git diff HEAD^ HEAD --quiet -- \
      ":!./*.md" \
      ":!./Dockerfile" \
      ":!./.github" \
      ":!./.husky" \
      ":!./scripts"';

    execSync(diffCommand);
    // 如果 execSync 没有抛出错误，说明没有变更
    return false;
  } catch (e) {
    console.log(e);
    // 如果 execSync 抛出错误，说明有变更
    return true;
  }
}

const shouldBuild = shouldProceedBuild();

console.log('shouldBuild:', shouldBuild);
if (shouldBuild) {
  console.log('✅ - Build can proceed');
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
} else {
  console.log('🛑 - Build cancelled');
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
}
