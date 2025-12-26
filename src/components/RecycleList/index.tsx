'use client';

import React, { useMemo } from 'react';

import { VList } from '@/components/VirtualList';

export interface RecycleListSlotProps<T> {
  index: number;
  item: T;
}

type SlotProps<P extends object> = P & { children: React.ReactElement };

/**
 * A minimal Slot implementation (similar to Radix Slot):
 * it clones the only child and injects props into it.
 */
const Slot = <P extends object>({ children, ...props }: SlotProps<P>) => {
  if (!React.isValidElement(children)) return null;
  return React.cloneElement(children, props as any);
};

interface RecycleListProps<T> {
  children: React.ReactElement<Partial<RecycleListSlotProps<T>>>;
  estimateItemSize: number;
  height: number;
  items: T[];
  overscan?: number;
  style?: React.CSSProperties;
  width?: React.CSSProperties['width'];
}

const RecycleList = <T,>({
  children,
  estimateItemSize,
  height,
  items,
  overscan = 10,
  style,
  width = '100%',
}: RecycleListProps<T>) => {
  const mergedStyle = useMemo<React.CSSProperties>(
    () => ({
      height,
      width,
      ...style,
    }),
    [height, style, width],
  );

  return (
    <VList
      bufferSize={overscan * estimateItemSize}
      data={items}
      itemSize={estimateItemSize}
      style={mergedStyle}
    >
      {(item, index) => (
        <Slot<RecycleListSlotProps<T>> index={index} item={item}>
          {children}
        </Slot>
      )}
    </VList>
  );
};

export default RecycleList;
