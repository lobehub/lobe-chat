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

export const imageUrlToBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const res = await fetch(imageUrl);
    const arrayBuffer = await res.arrayBuffer();

    return typeof btoa === 'function'
      ? btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''),
        )
      : Buffer.from(arrayBuffer).toString('base64');
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};
