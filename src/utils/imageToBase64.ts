export const imageToBase64 = ({
  size,
  img,
  type = 'image/webp',
}: {
  img: HTMLImageElement;
  size: number;
  type?: string;
}) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  let startX = 0;
  let startY = 0;

  if (img.width > img.height) {
    startX = (img.width - img.height) / 2;
  } else {
    startY = (img.height - img.width) / 2;
  }

  canvas.width = size;
  canvas.height = size;

  ctx.drawImage(
    img,
    startX,
    startY,
    Math.min(img.width, img.height),
    Math.min(img.width, img.height),
    0,
    0,
    size,
    size,
  );

  return canvas.toDataURL(type);
};

export const imageUrlToBase64 = async (
  imageUrl: string,
): Promise<{ base64: string; mimeType: string }> => {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();

    const base64 =
      typeof btoa === 'function'
        ? btoa(
            new Uint8Array(arrayBuffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              '',
            ),
          )
        : Buffer.from(arrayBuffer).toString('base64');

    return { base64, mimeType: blob.type };
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

// 修改后的版本，通过 proxy 获取
export const imageUrlToBase64ViaProxy = async (
  imageUrl: string,
): Promise<{ base64: string; mimeType: string }> => {
  try {
    const res = await fetch('/webapi/proxy', { body: imageUrl, method: 'POST' });

    if (!res.ok) {
      // 处理代理返回的错误状态，例如 400 Bad Request
      const errorData = await res.json().catch(() => ({})); // 尝试解析JSON错误信息
      throw new Error(
        `Proxy request failed for ${imageUrl} with status ${res.status}: ${errorData.error || 'Unknown error'}`,
      );
    }

    // 代理成功返回了目标资源的数据
    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();

    const base64 =
      typeof btoa === 'function'
        ? btoa(
            new Uint8Array(arrayBuffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              '',
            ),
          )
        : // 在 Node.js 服务端（如果这段逻辑也在服务端执行）或某些环境中可能需要 Buffer
          typeof Buffer !== 'undefined'
          ? Buffer.from(arrayBuffer).toString('base64')
          : // Fallback or handle error if neither btoa nor Buffer is available
            (() => {
              throw new Error('Base64 conversion environment not supported.');
            })();

    // mimeType 可以从响应头获取，如果代理传递了的话
    const mimeType = res.headers.get('content-type') || blob.type || 'application/octet-stream'; // 从响应头获取，或回退到 blob type

    return { base64, mimeType };
  } catch (error) {
    console.error('Error converting image via proxy to base64:', error);
    throw error; // Re-throw or handle as needed
  }
};
