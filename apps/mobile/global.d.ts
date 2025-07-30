import 'expo-crypto';

declare global {
  interface Window {
    crypto: Crypto;
  }

  const crypto: Crypto;
}

// JSON 模块声明
declare module '*.json' {
  const value: any;
  export default value;
}

// 确保这个文件被当作模块处理
export {};
