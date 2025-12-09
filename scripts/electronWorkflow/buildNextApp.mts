import fs from 'fs-extra';
import { execSync } from 'node:child_process';
import path from 'node:path';

import { runPrebuild } from '../prebuild.mjs';

const PROJECT_ROOT = process.cwd();
const TEMP_DIR = path.join(PROJECT_ROOT, 'tmp', 'desktop-build');

const foldersToSymlink = [
  'node_modules',
  'packages',
  'public',
  'locales',
  'docs', // Some builds might reference docs
  '.cursor', // IDE rules
  'apps',
];

const foldersToCopy = ['src', 'scripts'];

// Files to copy from root
const filesToCopy = [
  'package.json',
  'tsconfig.json',
  'next.config.ts',
  'pnpm-workspace.yaml',
  'bun.lockb',
  '.npmrc',
  '.bunfig.toml',
  '.eslintrc.js',
  '.eslintignore',
  '.prettierrc.cjs',
  '.prettierignore',
  'drizzle.config.ts',
  'postcss.config.js',
  'tailwind.config.ts',
  'tailwind.config.js',
];

const build = async () => {
  console.log('🚀 Starting Electron App Build in Shadow Workspace...');
  console.log(`📂 Workspace: ${TEMP_DIR}`);

  // 1. Cleanup and Create Temp Dir
  if (fs.existsSync(TEMP_DIR)) {
    await fs.remove(TEMP_DIR);
  }
  await fs.ensureDir(TEMP_DIR);

  // 2. Symlink Folders
  console.log('🔗 Symlinking dependencies and static assets...');
  for (const folder of foldersToSymlink) {
    const srcPath = path.join(PROJECT_ROOT, folder);
    const destPath = path.join(TEMP_DIR, folder);
    if (fs.existsSync(srcPath)) {
      await fs.ensureSymlink(srcPath, destPath);
    }
  }

  // 3. Copy Folders (src, scripts)
  console.log('📋 Copying source code...');
  for (const folder of foldersToCopy) {
    const srcPath = path.join(PROJECT_ROOT, folder);
    const destPath = path.join(TEMP_DIR, folder);
    if (fs.existsSync(srcPath)) {
      await fs.copy(srcPath, destPath);
    }
  }

  // 4. Copy Root Configuration Files
  console.log('📄 Copying configuration files...');
  // Find all .env files
  const allFiles = await fs.readdir(PROJECT_ROOT);
  const envFiles = allFiles.filter((f) => f.startsWith('.env'));

  const files = [...filesToCopy, ...envFiles];

  for (const file of files) {
    const srcPath = path.join(PROJECT_ROOT, file);
    const destPath = path.join(TEMP_DIR, file);
    if (fs.existsSync(srcPath)) {
      await fs.copy(srcPath, destPath);
    }
  }

  // 5. Run Prebuild on Temp Src
  console.log('✂️  Pruning desktop-incompatible code...');
  // We pass the relative path 'src' because we will run this context
  // But wait, runPrebuild resolves against process.cwd().
  // If we call runPrebuild from here (PROJECT_ROOT), we must pass 'tmp/desktop-build/src'.
  // But runPrebuild logic replaces 'src' prefix.
  // path.resolve(process.cwd(), 'tmp/desktop-build/src/...')
  // This looks correct.
  const relativeTempSrc = path.relative(PROJECT_ROOT, path.join(TEMP_DIR, 'src'));
  await runPrebuild(relativeTempSrc);

  // 6. Run Next.js Build
  console.log('🏗  Running next build in shadow workspace...');
  try {
    // We run inside the TEMP_DIR
    execSync('next build --webpack', {
      cwd: TEMP_DIR,
      env: {
        ...process.env,
        // Ensure NODE_OPTIONS are preserved or set
        NODE_OPTIONS: process.env.NODE_OPTIONS || '--max-old-space-size=6144',
      },
      stdio: 'inherit',
    });

    // 7. Extract Artifacts
    console.log('📦 Extracting build artifacts...');
    const sourceNextDir = path.join(TEMP_DIR, '.next');
    const targetNextDir = path.join(PROJECT_ROOT, '.next');

    if (fs.existsSync(targetNextDir)) {
      await fs.remove(targetNextDir);
    }
    // We move it back to root so other scripts (electron builder) can find it
    await fs.move(sourceNextDir, targetNextDir);

    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed.');
    throw error;
  } finally {
    // Optional: Keep temp dir for debugging if failed?
    // Or clean it up. Let's clean up to save space.
    console.log('🧹 Cleaning up workspace...');
    await fs.remove(TEMP_DIR);
  }
};

await build().catch((err) => {
  console.error(err);
  throw err;
});
