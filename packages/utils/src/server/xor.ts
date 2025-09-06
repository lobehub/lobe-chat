import { ClientSecretPayload } from '@lobechat/types';

import { SECRET_XOR_KEY } from '@/const/auth';

/**
 * 将 Base64 字符串转换为 Uint8Array
 */
const base64ToUint8Array = (base64: string): Uint8Array => {
  // Node.js 环境下直接使用 Buffer
  return Buffer.from(base64, 'base64');
};

/**
 * 对 Uint8Array 进行 XOR 运算 (与客户端的 xorProcess 函数相同)
 */
const xorProcess = (data: Uint8Array, key: Uint8Array): Uint8Array => {
  const result = new Uint8Array(data.length);
  for (const [i, datum] of data.entries()) {
    result[i] = datum ^ key[i % key.length];
  }
  return result;
};

/**
 * 将 Uint8Array 转换为字符串 (UTF-8 解码)
 */
const uint8ArrayToString = (arr: Uint8Array): string => {
  return new TextDecoder().decode(arr);
};

export const getXorPayload = (token: string): ClientSecretPayload => {
  const keyBytes = new TextEncoder().encode(SECRET_XOR_KEY);

  // 1. Base64 解码
  const base64DecodedBytes = base64ToUint8Array(token);

  // 2. XOR 解混淆
  const xorDecryptedBytes = xorProcess(base64DecodedBytes, keyBytes);

  // 3. 转换为字符串并解析 JSON
  const decodedJsonString = uint8ArrayToString(xorDecryptedBytes);

  return JSON.parse(decodedJsonString) as ClientSecretPayload;
};
