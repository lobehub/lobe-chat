import { createContext } from 'react';

import type { PreviewGroupContextValue } from './type';

/**
 * PreviewGroup Context
 * 用于在 PreviewGroup 内部管理图片预览
 */
export const PreviewGroupContext = createContext<PreviewGroupContextValue>({
  inGroup: false,
  preview: true,
  registerImage: () => 0,
  showPreview: () => {},
  unregisterImage: () => {},
});
