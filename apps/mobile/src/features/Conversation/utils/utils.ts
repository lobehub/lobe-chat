export const AT_BOTTOM_EPSILON = 100;
export const ESTIMATED_MESSAGE_HEIGHT = 240;

export const computeAtBottom = (layoutH = 0, contentH = 0, offsetY = 0) => {
  const maxOffset = Math.max(0, contentH - layoutH);
  let offset = offsetY;
  if (offset < 0) offset = 0;
  if (offset > maxOffset) offset = maxOffset;

  // If content fits entirely in the viewport, we're at bottom
  if (contentH <= layoutH) return true;

  // Distance from viewport bottom to content bottom
  const distance = contentH - (offset + layoutH);
  return distance <= AT_BOTTOM_EPSILON;
};
