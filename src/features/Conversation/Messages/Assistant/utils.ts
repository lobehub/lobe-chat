import { AssistantContentBlock } from '@lobechat/types';

export type BlockPosition = 'start' | 'middle' | 'end' | 'standalone';

/**
 * Get the position of a block in a sequence of blocks containing tools
 * Used to determine border styling for consecutive tool-containing blocks
 */
export const getBlockPosition = (
  children: AssistantContentBlock[],
  index: number,
): BlockPosition | undefined => {
  const currentHasTools = !!children[index]?.tools && children[index].tools!.length > 0;
  const prevHasTools =
    index > 0 && !!children[index - 1]?.tools && children[index - 1].tools!.length > 0;
  const nextHasTools =
    index < children.length - 1 &&
    !!children[index + 1]?.tools &&
    children[index + 1].tools!.length > 0;

  if (!currentHasTools) return undefined;

  const isStart = currentHasTools && !prevHasTools && nextHasTools;
  const isMiddle = currentHasTools && prevHasTools && nextHasTools;
  const isEnd = currentHasTools && prevHasTools && !nextHasTools;
  const isStandalone = currentHasTools && !prevHasTools && !nextHasTools;

  if (isStandalone) return 'standalone';
  if (isStart) return 'start';
  if (isMiddle) return 'middle';
  if (isEnd) return 'end';
  return undefined;
};
