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
    let res: Response;

    // Environment-aware fetch: use SSRF-safe fetch on server, regular fetch on client
    if (typeof window === 'undefined') {
      // Server environment: use SSRF-safe fetch
      const { ssrfSafeFetch } = await import('@lobechat/utils/server');
      res = await ssrfSafeFetch(imageUrl);
    } else {
      // Client environment: use regular fetch (browser has CORS protection)
      res = await fetch(imageUrl);
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'application/octet-stream';

    const base64 =
      typeof btoa === 'function'
        ? btoa(
            new Uint8Array(arrayBuffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              '',
            ),
          )
        : Buffer.from(arrayBuffer).toString('base64');

    return { base64, mimeType: contentType };
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};
