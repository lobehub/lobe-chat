const compressImage = ({ img, type = 'image/webp' }: { img: HTMLImageElement; type?: string }) => {
  // 设置最大宽高
  const maxWidth = 2160;
  const maxHeight = 2160;
  let width = img.width;
  let height = img.height;

  if (width > height && width > maxWidth) {
    // 如果图片宽度大于高度且大于最大宽度限制
    width = maxWidth;
    height = Math.round((maxWidth / img.width) * img.height);
  } else if (height > width && height > maxHeight) {
    // 如果图片高度大于宽度且大于最大高度限制
    height = maxHeight;
    width = Math.round((maxHeight / img.height) * img.width);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);

  return canvas.toDataURL(type);
};

export default compressImage;
