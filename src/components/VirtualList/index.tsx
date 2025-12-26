'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import React, {
  type ReactElement,
  type ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';

export interface ScrollToIndexOptions {
  align?: 'start' | 'center' | 'end' | 'nearest';
  offset?: number;
  smooth?: boolean;
}

export interface VListHandle {
  readonly scrollOffset: number;
  readonly scrollSize: number;
  readonly viewportSize: number;
  findItemIndex: (offset: number) => number;
  getItemOffset: (index: number) => number;
  getItemSize: (index: number) => number;
  scrollBy: (offset: number) => void;
  scrollTo: (offset: number) => void;
  scrollToIndex: (index: number, opts?: ScrollToIndexOptions) => void;
}

interface ViewportComponentAttributes
  extends Pick<
      React.HTMLAttributes<HTMLElement>,
      'className' | 'style' | 'id' | 'role' | 'tabIndex' | 'onKeyDown' | 'onWheel'
    >,
    React.AriaAttributes {}

export interface CustomItemComponentProps {
  children: ReactNode;
  index: number;
  style: React.CSSProperties;
}

type CustomItemComponent = React.ComponentType<CustomItemComponentProps>;
type VListChildRenderer<T> = (data: T, index: number) => ReactElement;

export interface VListProps<T = unknown> extends ViewportComponentAttributes {
  bufferSize?: number;
  children: ReactNode | VListChildRenderer<T>;
  data?: ArrayLike<T>;
  horizontal?: boolean;
  item?: keyof JSX.IntrinsicElements | CustomItemComponent;
  itemSize?: number;
  keepMounted?: readonly number[];
  onScroll?: (offset: number) => void;
  onScrollEnd?: () => void;
  cache?: unknown;
  shift?: boolean;
  ssrCount?: number;
}

const DEFAULT_BUFFER_SIZE = 200;
const DEFAULT_ESTIMATE_SIZE = 40;
const SCROLL_END_DELAY_MS = 150;

const VList = forwardRef<VListHandle, VListProps<any>>(
  (
    {
      bufferSize = DEFAULT_BUFFER_SIZE,
      children,
      className,
      data,
      horizontal = false,
      item: ItemComponent = 'div',
      itemSize,
      keepMounted,
      onScroll,
      onScrollEnd,
      style,
      cache: _cache,
      shift: _shift,
      ssrCount: _ssrCount,
      ...rest
    },
    ref,
  ) => {
    const parentRef = useRef<HTMLDivElement | null>(null);
    const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { items, renderItem } = useMemo(() => {
      if (typeof children === 'function') {
        const resolvedData = data ? (Array.isArray(data) ? data : Array.from(data)) : [];
        return {
          items: resolvedData,
          renderItem: (index: number) => {
            const item = resolvedData[index];
            if (item === undefined) return null;
            return (children as VListChildRenderer<any>)(item, index);
          },
        };
      }

      const resolvedChildren = React.Children.toArray(children);

      return {
        items: resolvedChildren,
        renderItem: (index: number) => resolvedChildren[index] ?? null,
      };
    }, [children, data]);

    const estimateSize = useCallback(
      () => itemSize ?? DEFAULT_ESTIMATE_SIZE,
      [itemSize],
    );

    const overscan = useMemo(() => {
      const estimate = itemSize ?? DEFAULT_ESTIMATE_SIZE;
      if (estimate <= 0) return 0;
      return Math.max(0, Math.ceil(bufferSize / estimate));
    }, [bufferSize, itemSize]);

    const rowVirtualizer = useVirtualizer({
      count: items.length,
      estimateSize,
      getScrollElement: () => parentRef.current,
      horizontal,
      overscan,
    });

    const virtualItems = rowVirtualizer.getVirtualItems();
    const measurements = rowVirtualizer.getMeasurements();
    const totalSize = rowVirtualizer.getTotalSize();

    const itemsToRender = useMemo(() => {
      if (!keepMounted?.length) return virtualItems;

      const map = new Map<number, (typeof virtualItems)[number]>();

      virtualItems.forEach((item) => {
        map.set(item.index, item);
      });

      keepMounted.forEach((index) => {
        const measurement = measurements[index];
        if (measurement) map.set(index, measurement);
      });

      return Array.from(map.values()).sort((a, b) => a.index - b.index);
    }, [keepMounted, measurements, virtualItems]);

    const handleScroll = useCallback(
      (event: React.UIEvent<HTMLDivElement>) => {
        const target = event.currentTarget;
        const offset = horizontal ? target.scrollLeft : target.scrollTop;

        onScroll?.(offset);

        if (!onScrollEnd) return;

        if (scrollEndTimerRef.current) {
          clearTimeout(scrollEndTimerRef.current);
        }

        scrollEndTimerRef.current = setTimeout(() => {
          scrollEndTimerRef.current = null;
          onScrollEnd();
        }, SCROLL_END_DELAY_MS);
      },
      [horizontal, onScroll, onScrollEnd],
    );

    useEffect(() => {
      return () => {
        if (scrollEndTimerRef.current) {
          clearTimeout(scrollEndTimerRef.current);
        }
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        get scrollOffset() {
          const element = parentRef.current;
          if (!element) return 0;
          return horizontal ? element.scrollLeft : element.scrollTop;
        },
        get scrollSize() {
          const element = parentRef.current;
          const viewportSize = element
            ? horizontal
              ? element.clientWidth
              : element.clientHeight
            : 0;
          return Math.max(rowVirtualizer.getTotalSize(), viewportSize);
        },
        get viewportSize() {
          const element = parentRef.current;
          if (!element) return 0;
          return horizontal ? element.clientWidth : element.clientHeight;
        },
        findItemIndex: (offset: number) => {
          const item = rowVirtualizer.getVirtualItemForOffset(offset);
          return item?.index ?? 0;
        },
        getItemOffset: (index: number) => {
          const offsetInfo = rowVirtualizer.getOffsetForIndex(index, 'start');
          return offsetInfo?.[0] ?? 0;
        },
        getItemSize: (index: number) => {
          const measurement = rowVirtualizer.getMeasurements()[index];
          if (measurement) return measurement.size;
          return itemSize ?? DEFAULT_ESTIMATE_SIZE;
        },
        scrollBy: (offset: number) => {
          rowVirtualizer.scrollBy(offset);
        },
        scrollTo: (offset: number) => {
          rowVirtualizer.scrollToOffset(offset, { align: 'start' });
        },
        scrollToIndex: (index: number, opts?: ScrollToIndexOptions) => {
          const align = opts?.align ?? 'start';
          const behavior = opts?.smooth ? 'smooth' : 'auto';
          const mappedAlign = align === 'nearest' ? 'auto' : align;

          rowVirtualizer.scrollToIndex(index, { align: mappedAlign, behavior });

          if (opts?.offset) {
            rowVirtualizer.scrollBy(opts.offset, { behavior });
          }
        },
      }),
      [horizontal, itemSize, rowVirtualizer],
    );

    const mergedStyle = useMemo<React.CSSProperties>(
      () => ({
        contain: 'strict',
        display: horizontal ? 'inline-block' : 'block',
        height: '100%',
        overflowX: horizontal ? 'auto' : 'hidden',
        overflowY: horizontal ? 'hidden' : 'auto',
        width: '100%',
        ...style,
      }),
      [horizontal, style],
    );

    const innerStyle = useMemo<React.CSSProperties>(
      () => ({
        contain: 'size style',
        flex: 'none',
        height: horizontal ? '100%' : totalSize,
        overflowAnchor: 'none',
        position: 'relative',
        width: horizontal ? totalSize : '100%',
      }),
      [horizontal, totalSize],
    );

    const renderItemNode = useCallback(
      (virtualRow: (typeof virtualItems)[number]) => {
        const Item = ItemComponent as React.ElementType;
        const isIntrinsic = typeof ItemComponent === 'string';
        const offsetStyle: React.CSSProperties = {
          left: 0,
          position: 'absolute',
          top: 0,
          transform: horizontal
            ? `translateX(${virtualRow.start}px)`
            : `translateY(${virtualRow.start}px)`,
          height: horizontal ? '100%' : undefined,
          width: horizontal ? undefined : '100%',
        };

        const itemNode = renderItem(virtualRow.index);
        if (!itemNode) return null;

        const itemKey =
          React.isValidElement(itemNode) && itemNode.key !== null ? itemNode.key : virtualRow.key;

        const props = {
          'data-index': virtualRow.index,
          ref: rowVirtualizer.measureElement,
          style: offsetStyle,
          ...(isIntrinsic ? null : { index: virtualRow.index }),
        };

        return (
          <Item key={itemKey} {...props}>
            {itemNode}
          </Item>
        );
      },
      [horizontal, ItemComponent, renderItem, rowVirtualizer],
    );

    return (
      <div className={className} onScroll={handleScroll} ref={parentRef} style={mergedStyle} {...rest}>
        <div style={innerStyle}>{itemsToRender.map(renderItemNode)}</div>
      </div>
    );
  },
);

VList.displayName = 'VList';

export { VList };
