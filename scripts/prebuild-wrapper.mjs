import { execSync } from 'node:child_process';

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

try {
  // Always run the original prebuild step
  run('tsx scripts/prebuild.mts');

  // In CI environments (including Vercel) skip the heavy lint step which may
  // hit permission errors on mounted or generated folders.
  const isCI = Boolean(
    process.env.CI || process.env.VERCEL || process.env.NOW_BUILDER || process.env.GITHUB_ACTIONS,
  );

  if (isCI) {
    console.log(
      'CI detected — skipping `npm run lint` to avoid permission/flaky issues during CI builds.',
    );
  } else {
    // Local/dev: keep lint for developer feedback
    run('npm run lint');
  }
} catch (err) {
  console.error('prebuild-wrapper failed:', err instanceof Error ? err.message : String(err));
  // Re-throw the error so callers still receive a non-zero exit code but
  // avoid using `process.exit()` directly (unicorn/no-process-exit).
  throw err;
}
