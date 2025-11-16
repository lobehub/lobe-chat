'use client';

import { isDesktop } from '@lobechat/const';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ReactNode, memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Flexbox } from 'react-layout-kit';

import {
  removeVirtuosoVisibleItem,
  upsertVirtuosoVisibleItem,
} from '@/features/Conversation/components/VirtualizedList/VirtuosoContext';
import { getChatStoreState, useChatStore } from '@/store/chat';
import { displayMessageSelectors, messageStateSelectors } from '@/store/chat/selectors';

import History from '../components/History';
import { InPortalThreadContext } from '../context/InPortalThreadContext';
import AssistantMessage from './Assistant';
import GroupMessage from './Group';
import SupervisorMessage from './Supervisor';
import ToolMessage from './Tool';
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

    const [isMessageLoading, role] = useChatStore((s) => [
      messageStateSelectors.isMessageLoading(id)(s),
      displayMessageSelectors.getDisplayMessageById(id)(s)?.role,
    ]);

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
      const item = displayMessageSelectors.getDisplayMessageById(id)(getChatStoreState());

      if (isDesktop && item) {
        const { electronSystemService } = await import('@/services/electron/system');

        electronSystemService.showContextMenu('chat', {
          content: item.content,
          hasError: !!item.error,
          messageId: id,
          role: item.role,
        });
      }
    }, [id]);

    const renderContent = useMemo(() => {
      switch (role) {
        case 'user': {
          return <UserMessage disableEditing={disableEditing} id={id} index={index} />;
        }

        case 'assistant': {
          return <AssistantMessage disableEditing={disableEditing} id={id} index={index} />;
        }

        case 'assistantGroup': {
          return <GroupMessage disableEditing={disableEditing} id={id} index={index} />;
        }

        case 'tool': {
          return <ToolMessage id={id} index={index} />;
        }

        case 'supervisor': {
          return <SupervisorMessage disableEditing={disableEditing} id={id} index={index} />;
        }
      }

      return null;
    }, [role, disableEditing, id, index]);

    if (!role) return;

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
  isEqual,
);

Item.displayName = 'ChatItem';

export default Item;
