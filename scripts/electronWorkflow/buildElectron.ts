/* eslint-disable unicorn/no-process-exit */
import { execSync } from 'node:child_process';
import os from 'node:os';

/**
 * Build desktop application based on current operating system platform
 */
const buildElectron = () => {
  const platform = os.platform();

  console.log(`🔨 Starting to build desktop app for ${platform} platform...`);

  try {
    let buildCommand = '';

    // Determine build command based on platform
    switch (platform) {
      case 'darwin': {
        buildCommand = 'npm run build:mac --prefix=./apps/desktop';
        console.log('📦 Building macOS desktop application...');
        break;
      }
      case 'win32': {
        buildCommand = 'npm run build:win --prefix=./apps/desktop';
        console.log('📦 Building Windows desktop application...');
        break;
      }
      case 'linux': {
        buildCommand = 'npm run build:linux --prefix=./apps/desktop';
        console.log('📦 Building Linux desktop application...');
        break;
      }
      default: {
        throw new Error(`Unsupported platform: ${platform}`);
      }
    }

    // Execute build command
    execSync(buildCommand, { stdio: 'inherit' });

    console.log('✅ Desktop application build completed!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
};

// Execute build
buildElectron();
