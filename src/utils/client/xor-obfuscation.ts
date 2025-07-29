import { SECRET_XOR_KEY } from '@/const/auth';

/**
 * 将字符串转换为 Uint8Array (UTF-8 编码)
 */
const stringToUint8Array = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

/**
 * 对 Uint8Array 进行 XOR 运算
 * @param data 要处理的 Uint8Array
 * @param key 用于 XOR 的密钥 (Uint8Array)
 * @returns 经过 XOR 运算的 Uint8Array
 */
const xorProcess = (data: Uint8Array, key: Uint8Array): Uint8Array => {
  const result = new Uint8Array(data.length);
  for (const [i, datum] of data.entries()) {
    result[i] = datum ^ key[i % key.length]; // 密钥循环使用
  }
  return result;
};

/**
 * 对 payload 进行 XOR 混淆并 Base64 编码
 * @param payload 要混淆的 JSON 对象
 * @returns Base64 编码后的混淆字符串
 */
export const obfuscatePayloadWithXOR = <T>(payload: T): string => {
  const jsonString = JSON.stringify(payload);
  const dataBytes = stringToUint8Array(jsonString);
  const keyBytes = stringToUint8Array(SECRET_XOR_KEY);

  const xoredBytes = xorProcess(dataBytes, keyBytes);

  // 将 Uint8Array 转换为 Base64 字符串
  // 浏览器环境 btoa 只能处理 Latin-1 字符，所以需要先转换为适合 btoa 的字符串
  return btoa(String.fromCharCode(...xoredBytes));
};
