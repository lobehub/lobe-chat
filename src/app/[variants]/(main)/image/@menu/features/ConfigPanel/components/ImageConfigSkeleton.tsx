'use client';

import { Skeleton } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

/**
 * Skeleton loading state for image configuration panel
 * Provides visual feedback during initialization
 */
const ImageConfigSkeleton = memo(() => {
  return (
    <Flexbox gap={32} padding="12px 12px 0 12px" style={{ height: '100%' }}>
      {/* Model Selection */}
      <Flexbox gap={8}>
        <Skeleton.Input size="small" style={{ width: 100 }} />
        <Skeleton.Input size="large" style={{ width: '100%' }} />
      </Flexbox>

      {/* Image Upload Area */}
      <Flexbox gap={8}>
        <Skeleton.Input size="small" style={{ width: 60 }} />
        <Skeleton.Node
          style={{
            borderRadius: 8,
            height: 100,
            width: '100%',
          }}
        />
      </Flexbox>

      {/* Parameter Controls */}
      {Array.from({ length: 2 }, (_, index) => (
        <Flexbox gap={8} key={index}>
          <Skeleton.Input size="small" style={{ width: 80 }} />
          <Skeleton.Input size="default" style={{ width: '100%' }} />
        </Flexbox>
      ))}

      {/* Image Number Control (Sticky at bottom) */}
      <Flexbox padding="12px 0" style={{ marginTop: 'auto' }}>
        <Flexbox gap={8}>
          <Skeleton.Input size="small" style={{ width: 60 }} />
          <Skeleton.Input size="default" style={{ width: '100%' }} />
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

ImageConfigSkeleton.displayName = 'ImageConfigSkeleton';

export default ImageConfigSkeleton;
