import { Context } from 'hono';
import urlJoin from 'url-join';

import { fileEnv } from '@/config/file';

/**
 * 给文件添加URL前缀
 * @param file 文件对象
 * @returns 添加了URL前缀的文件对象
 */
export function addFileUrlPrefix<T extends { url?: string }>(file: T): T {
  // 从 fileEnv 中获取公共域名前缀
  const publicDomain = fileEnv.S3_PUBLIC_DOMAIN;

  if (!publicDomain) {
    return file;
  }

  // 如果已经有完整的URL，直接返回
  if (file.url && (file.url.startsWith('http://') || file.url.startsWith('https://'))) {
    return file;
  }

  return {
    ...file,
    url: urlJoin(publicDomain, file.url || ''),
  };
}

/**
 * 批量给文件数组添加URL前缀
 * @param files 文件数组
 * @returns 添加了URL前缀的文件数组
 */
export function addFilesUrlPrefix<T extends { path?: string; url?: string }>(files: T[]): T[] {
  return files.map(addFileUrlPrefix);
}

/**
 * 通用的 multipart/form-data 解析器
 * 当原生 formData() 失败时的备用方案
 */
export async function parseFormData(c: Context): Promise<FormData> {
  const contentType = c.req.header('content-type') || '';
  const boundaryMatch = contentType.match(/boundary=(.+)$/);

  if (!boundaryMatch) {
    throw new Error('无法找到 multipart boundary');
  }

  const boundary = boundaryMatch[1];
  const bodyBuffer = await c.req.arrayBuffer();
  const bodyBytes = new Uint8Array(bodyBuffer);
  const formData = new FormData();

  // 转换 boundary 为字节数组
  const boundaryBytes = new TextEncoder().encode(`--${boundary}`);

  // 找到所有 boundary 位置
  const boundaryPositions: number[] = [];
  for (let i = 0; i <= bodyBytes.length - boundaryBytes.length; i++) {
    let match = true;
    for (const [j, boundaryByte] of boundaryBytes.entries()) {
      if (bodyBytes[i + j] !== boundaryByte) {
        match = false;
        break;
      }
    }
    if (match) {
      boundaryPositions.push(i);
    }
  }

  // 解析每个 part
  for (let i = 0; i < boundaryPositions.length - 1; i++) {
    const partStart = boundaryPositions[i] + boundaryBytes.length + 2; // +2 for \r\n
    const partEnd = boundaryPositions[i + 1];

    if (partStart >= partEnd) continue;

    const partBytes = bodyBytes.slice(partStart, partEnd - 2); // -2 for \r\n

    // 找到头部和内容的分隔符 \r\n\r\n
    const headerEndPattern = new TextEncoder().encode('\r\n\r\n');
    let headerEnd = -1;

    for (let j = 0; j <= partBytes.length - headerEndPattern.length; j++) {
      let match = true;
      for (const [k, element] of headerEndPattern.entries()) {
        if (partBytes[j + k] !== element) {
          match = false;
          break;
        }
      }
      if (match) {
        headerEnd = j;
        break;
      }
    }

    if (headerEnd === -1) continue;

    const headerBytes = partBytes.slice(0, headerEnd);
    const contentBytes = partBytes.slice(headerEnd + 4); // +4 for \r\n\r\n

    const headers = new TextDecoder().decode(headerBytes);

    // 解析 Content-Disposition 头
    const dispositionMatch = headers.match(
      /content-disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]+)")?/i,
    );
    if (!dispositionMatch) continue;

    const fieldName = dispositionMatch[1];
    const fileName = dispositionMatch[2];

    if (fileName) {
      // 这是文件字段
      const contentTypeMatch = headers.match(/content-type:\s*(.+)/i);
      const fileType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';

      // 创建 File 对象
      const file = new File([contentBytes], fileName, { type: fileType });
      formData.append(fieldName, file);
    } else {
      // 这是普通字段
      const content = new TextDecoder().decode(contentBytes).trim();
      formData.append(fieldName, content);
    }
  }

  return formData;
}
