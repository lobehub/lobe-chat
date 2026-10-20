import { CanvasIdentifier } from '@lobechat/builtin-tool-canvas';
import type { UserLab } from '@lobechat/types';

export const LAB_GATED_TOOLS: Record<string, keyof UserLab> = {
  [CanvasIdentifier]: 'enableCanvas',
};

export const getLabDisabledToolIds = (lab: Partial<UserLab> | undefined) =>
  Object.entries(LAB_GATED_TOOLS)
    .filter(([, flag]) => lab?.[flag] !== true)
    .map(([identifier]) => identifier);

export const isToolEnabledByLab = (identifier: string, lab: Partial<UserLab> | undefined) => {
  const flag = LAB_GATED_TOOLS[identifier];
  return !flag || lab?.[flag] === true;
};
