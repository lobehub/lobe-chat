'use client';

import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ReactNode, memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';

import { isDesktop } from '@/const/version';
import {
  removeVirtuosoVisibleItem,
  upsertVirtuosoVisibleItem,
} from '@/features/Conversation/components/VirtualizedList/VirtuosoContext';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import History from '../components/History';
import { InPortalThreadContext } from '../context/InPortalThreadContext';
import AssistantMessage from './Assistant';
import SupervisorMessage from './Supervisor';
import UserMessage from './User';

const useStyles = createStyles(({ css, prefixCls }) => ({
  loading: css`
    opacity: 0.6;
  `,
  message: css`
    position: relative;
    // prevent the textarea too long
    .${prefixCls}-input {
      max-height: 900px;
    }
  `,
}));

export interface ChatListItemProps {
  className?: string;
  disableEditing?: boolean;
  enableHistoryDivider?: boolean;
  endRender?: ReactNode;
  id: string;
  inPortalThread?: boolean;
  index: number;
}

const Item = memo<ChatListItemProps>(
  ({
    className,
    enableHistoryDivider,
    id,
    endRender,
    disableEditing,
    inPortalThread = false,
    index,
  }) => {
    const { styles, cx } = useStyles();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const item = useChatStore(chatSelectors.getMessageById(id), isEqual);

    const [isMessageLoading] = useChatStore((s) => [chatSelectors.isMessageLoading(id)(s)]);

    // ======================= Performance Optimization ======================= //
    // these useMemo/useCallback are all for the performance optimization
    // maybe we can remove it in React 19
    // ======================================================================== //

    useEffect(() => {
      if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

      const element = containerRef.current;
      if (!element) return;

      const root = element.closest('[data-virtuoso-scroller]');
      const thresholds = [0, 0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 1];
      const options: any = { threshold: thresholds };

      if (root instanceof Element) options.root = root;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target !== element) return;

          if (entry.isIntersecting) {
            const { bottom, top } = entry.intersectionRect;

            upsertVirtuosoVisibleItem(index, {
              bottom,
              ratio: entry.intersectionRatio,
              top,
            });
          } else {
            removeVirtuosoVisibleItem(index);
          }
        });
      }, options);

      observer.observe(element);

      return () => {
        observer.disconnect();
        removeVirtuosoVisibleItem(index);
      };
    }, [index]);

    const onContextMenu = useCallback(async () => {
      if (isDesktop && item) {
        const { electronSystemService } = await import('@/services/electron/system');

        electronSystemService.showContextMenu('chat', {
          content: item.content,
          hasError: !!item.error,
          messageId: id,
          role: item.role,
        });
      }
    }, [id, item]);

    const renderContent = useMemo(() => {
      switch (item?.role) {
        case 'user': {
          return <UserMessage {...item} disableEditing={disableEditing} index={index} />;
        }

        case 'assistant': {
          return (
            <AssistantMessage
              {...item}
              disableEditing={disableEditing}
              index={index}
              showTitle={item.groupId ? true : false}
            />
          );
        }

        case 'supervisor': {
          return <SupervisorMessage {...item} disableEditing={disableEditing} index={index} />;
        }
      }

      return null;
    }, [item]);

    if (!item) return;

    return (
      <InPortalThreadContext.Provider value={inPortalThread}>
        {enableHistoryDivider && <History />}
        <Flexbox
          className={cx(styles.message, className, isMessageLoading && styles.loading)}
          data-index={index}
          onContextMenu={onContextMenu}
          ref={containerRef}
        >
          {renderContent}
          {endRender}
        </Flexbox>
      </InPortalThreadContext.Provider>
    );
  },
);

Item.displayName = 'ChatItem';

export default Item;
