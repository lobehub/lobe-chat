import React, { memo, useCallback, useMemo, useRef } from 'react';
import { View } from 'react-native';

import { imageGallery } from '@/libs/imageGallery';

import { PreviewGroupContext } from './context';
import type { PreviewGroupProps } from './type';

/**
 * PreviewGroup 组件
 * 用于组织多个 Image 组件，使它们共享预览状态
 */
const PreviewGroup = memo<PreviewGroupProps>(({ children, preview = true, ...rest }) => {
  const imagesRef = useRef<string[]>([]);

  // 注册图片
  const registerImage = useCallback((url: string) => {
    const index = imagesRef.current.length;
    imagesRef.current.push(url);
    return index;
  }, []);

  // 注销图片
  const unregisterImage = useCallback((index: number) => {
    // 注意：为了保持索引稳定，我们不实际删除，只是标记为空
    // 在实际应用中，可以考虑更复杂的逻辑
    if (index >= 0 && index < imagesRef.current.length) {
      imagesRef.current[index] = '';
    }
  }, []);

  // 显示预览
  const showPreview = useCallback((index: number) => {
    const validImages = imagesRef.current.filter((url) => url !== '');
    if (validImages.length > 0) {
      // 重新计算有效索引
      const validIndex =
        imagesRef.current.slice(0, index + 1).filter((url) => url !== '').length - 1;
      imageGallery.show(validImages, Math.max(0, validIndex));
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      inGroup: true,
      preview,
      registerImage,
      showPreview,
      unregisterImage,
    }),
    [preview, registerImage, unregisterImage, showPreview],
  );

  return (
    <PreviewGroupContext.Provider value={contextValue}>
      <View {...rest}>{children}</View>
    </PreviewGroupContext.Provider>
  );
});

PreviewGroup.displayName = 'PreviewGroup';

export default PreviewGroup;
