import { markdownToTxt } from '@/utils/markdownToTxt';

const MIN_WIDTH = 5;
const MAX_WIDTH = 16;
const MAX_LENGTH = 80;

export const getIndicatorWidth = (content: string | undefined): number => {
  const length = content?.length ?? 0;

  // Smooth sqrt curve so very short messages render small and length grows
  // naturally up to MAX_LENGTH — no piecewise jump.
  const ratio = Math.min(Math.sqrt(length / MAX_LENGTH), 1);
  return MIN_WIDTH + (MAX_WIDTH - MIN_WIDTH) * ratio;
};

export const getPreviewText = (content: string | undefined): string => {
  if (!content) return '';

  const plainText = markdownToTxt(content);
  const normalized = plainText.replaceAll(/\s+/g, ' ').trim();
  if (!normalized) return '';

  return normalized.slice(0, 100) + (normalized.length > 100 ? '…' : '');
};

export const MIN_MESSAGES_THRESHOLD = 3;

/**
 * Width reserved at the inline end of the message list while the rail is
 * shown. The rail sits 8px from the edge and its widest dash is MAX_WIDTH,
 * so 24px keeps it in its own lane instead of covering wide content.
 */
export const MINIMAP_GUTTER_WIDTH = 24;

export const shouldShowMinimap = (userMessageCount: number): boolean =>
  userMessageCount > MIN_MESSAGES_THRESHOLD;
