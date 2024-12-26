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

export const compressImage = async ({
  file,
  size,
  type = 'image/webp',
  quality = 0.8,
}: {
  file: File;
  quality?: number;
  size: number;
  type?: string;
}): Promise<File> => {
  // 创建图片对象
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      // eslint-disable-next-line unicorn/prefer-add-event-listener
      img.onerror = reject;
      img.src = url;
    });

  // 将 File 转换为 Image
  const blob = new Blob([file], { type: file.type });
  const blobUrl = URL.createObjectURL(blob);
  const img = await createImage(blobUrl);

  // 创建 canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  // 计算裁剪位置，实现居中裁剪
  let startX = 0;
  let startY = 0;
  if (img.width > img.height) {
    startX = (img.width - img.height) / 2;
  } else {
    startY = (img.height - img.width) / 2;
  }

  // 设置 canvas 尺寸
  canvas.width = size;
  canvas.height = size;

  // 绘制图片
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

  // 清理 URL
  URL.revokeObjectURL(blobUrl);

  // 转换为 Blob
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) throw new Error('Canvas to Blob failed');
        // 创建新的 File 对象
        const compressedFile = new File([blob], file.name, {
          lastModified: Date.now(),
          type,
        });
        resolve(compressedFile);
      },
      type,
      quality,
    );
  });
};
