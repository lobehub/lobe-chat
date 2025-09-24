#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 Starting LobeChat Desktop Development Environment...');

let nextProcess;
let electronProcess;

// 健康检查函数
async function checkNextServer(port = 3015, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`http://localhost:${port}`, { timeout: 1000 });
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // 服务器还未启动
    }
    
    if (i === 0) {
      console.log('⏳ Waiting for Next.js server to start...');
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

// 启动 Next.js 开发服务器
function startNextServer() {
  return new Promise((resolve, reject) => {
    console.log('🌐 Starting Next.js development server...');
    
    nextProcess = spawn('npm', ['run', 'dev:desktop'], {
      cwd: rootDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    nextProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('[Next.js]', output.trim());
      
      // 检测启动成功标志
      if (output.includes('Ready in') || output.includes('compiled client and server')) {
        resolve();
      }
    });

    nextProcess.stderr.on('data', (data) => {
      console.error('[Next.js Error]', data.toString());
    });

    nextProcess.on('error', (error) => {
      console.error('❌ Failed to start Next.js server:', error);
      reject(error);
    });

    // 超时保护
    setTimeout(() => {
      resolve(); // 即使没有检测到启动标志也继续
    }, 10000);
  });
}

// 启动 Electron 应用
function startElectronApp() {
  return new Promise((resolve, reject) => {
    console.log('⚡ Starting Electron application...');
    
    const desktopDir = join(rootDir, 'apps/desktop');
    
    electronProcess = spawn('npm', ['run', 'electron:dev'], {
      cwd: desktopDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    electronProcess.stdout.on('data', (data) => {
      console.log('[Electron]', data.toString().trim());
    });

    electronProcess.stderr.on('data', (data) => {
      const error = data.toString();
      // 过滤一些常见的无害警告
      if (!error.includes('Electron Security Warning')) {
        console.error('[Electron Error]', error);
      }
    });

    electronProcess.on('error', (error) => {
      console.error('❌ Failed to start Electron app:', error);
      reject(error);
    });

    electronProcess.on('exit', (code) => {
      if (code !== 0) {
        console.log(`📱 Electron process exited with code ${code}`);
      }
    });

    resolve();
  });
}

// 清理函数
function cleanup() {
  console.log('\n🧹 Cleaning up processes...');
  
  if (nextProcess) {
    nextProcess.kill('SIGTERM');
  }
  
  if (electronProcess) {
    electronProcess.kill('SIGTERM');
  }
  
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}

// 主函数
async function main() {
  try {
    // 启动 Next.js 服务器
    await startNextServer();
    
    // 等待服务器完全启动
    console.log('🔍 Checking Next.js server health...');
    const isServerReady = await checkNextServer();
    
    if (isServerReady) {
      console.log('✅ Next.js server is ready!');
    } else {
      console.log('⚠️  Next.js server health check failed, but continuing...');
    }
    
    // 启动 Electron 应用
    await startElectronApp();
    
    console.log('\n🎉 Desktop development environment is ready!');
    console.log('📝 Tips:');
    console.log('  - Next.js server: http://localhost:3015');
    console.log('  - Electron DevTools: Cmd+Option+I (macOS)');
    console.log('  - Stop: Ctrl+C');
    
  } catch (error) {
    console.error('❌ Failed to start development environment:', error);
    cleanup();
  }
}

// 处理退出信号
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

// 启动
main();