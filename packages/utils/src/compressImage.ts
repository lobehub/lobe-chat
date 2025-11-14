const compressImage = ({ img, type = 'image/webp' }: { img: HTMLImageElement; type?: string }) => {
  // Set maximum width and height
  const maxWidth = 2160;
  const maxHeight = 2160;
  let width = img.width;
  let height = img.height;

  if (width > height && width > maxWidth) {
    // If image width is greater than height and exceeds maximum width limit
    width = maxWidth;
    height = Math.round((maxWidth / img.width) * img.height);
  } else if (height > width && height > maxHeight) {
    // If image height is greater than width and exceeds maximum height limit
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
