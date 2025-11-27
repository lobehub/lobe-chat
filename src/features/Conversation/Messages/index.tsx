'use client';

import { isDesktop } from '@lobechat/const';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import {
  MouseEvent,
  ReactNode,
  RefObject,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { Flexbox } from 'react-layout-kit';
import type { VListHandle } from 'virtua';

import ContextMenu from '../components/ContextMenu';
import History from '../components/History';
import { useChatItemContextMenu } from '../hooks/useChatItemContextMenu';
import {
  dataSelectors,
  messageStateSelectors,
  useConversationStore,
  virtuaListSelectors,
} from '../store';
import type { ActionsBarConfig } from '../types';
import AssistantMessage from './Assistant';
import AssistantGroupMessage from './AssistantGroup';
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

export interface MessageItemProps {
  actionsBar?: ActionsBarConfig;
  className?: string;
  disableEditing?: boolean;
  enableHistoryDivider?: boolean;
  endRender?: ReactNode;
  id: string;
  inPortalThread?: boolean;
  index: number;
  isLatestItem?: boolean;
}

const MessageItem = memo<MessageItemProps>(
  ({
    actionsBar,
    className,
    enableHistoryDivider,
    id,
    endRender,
    disableEditing,
    inPortalThread = false,
    index,
    isLatestItem,
  }) => {
    const { styles, cx } = useStyles();
    const containerRef = useRef<HTMLDivElement | null>(null);

    const topic = useConversationStore((s) => s.context.topicId);

    // Get message from ConversationStore instead of ChatStore
    const message = useConversationStore(dataSelectors.getDisplayMessageById(id), isEqual);
    const role = message?.role;

    const [editing, isMessageCreating] = useConversationStore((s) => [
      messageStateSelectors.isMessageEditing(id)(s),
      messageStateSelectors.isMessageCreating(id)(s),
    ]);

    // Get virtua methods from ConversationStore
    const upsertVisibleItem = useConversationStore((s) => s.upsertVisibleItem);
    const removeVisibleItem = useConversationStore((s) => s.removeVisibleItem);

    const {
      containerRef: contextMenuContainerRef,
      contextMenuState,
      handleContextMenu,
      hideContextMenu,
    } = useChatItemContextMenu({
      editing,
      onActionClick: () => {},
    });

    const setContainerRef = useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node;
        contextMenuContainerRef.current = node;
      },
      [contextMenuContainerRef],
    );

    // ======================= Performance Optimization ======================= //
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

            upsertVisibleItem(index, {
              bottom,
              ratio: entry.intersectionRatio,
              top,
            });
          } else {
            removeVisibleItem(index);
          }
        });
      }, options);

      observer.observe(element);

      return () => {
        observer.disconnect();
        removeVisibleItem(index);
      };
    }, [index, upsertVisibleItem, removeVisibleItem]);

    const onContextMenu = useCallback(
      async (event: MouseEvent<HTMLDivElement>) => {
        if (!role || (role !== 'user' && role !== 'assistant')) return;

        if (!message) return;

        if (isDesktop) {
          const { electronSystemService } = await import('@/services/electron/system');

          electronSystemService.showContextMenu('chat', {
            content: message.content,
            hasError: !!message.error,
            messageId: id,
            role: message.role,
          });

          return;
        }

        handleContextMenu(event);
      },
      [handleContextMenu, id, role, message],
    );
    // Get virtuaScrollMethods from ConversationStore
    const virtuaScrollMethods = useConversationStore(virtuaListSelectors.virtuaScrollMethods);

    // Create a ref-like object for ContextMenu compatibility
    // VirtuaScrollMethods is a subset of VListHandle with the methods ContextMenu needs
    const virtuaRef = useMemo<RefObject<VListHandle | null>>(
      () => ({ current: virtuaScrollMethods as VListHandle | null }),
      [virtuaScrollMethods],
    );

    const renderContent = useCallback(() => {
      switch (role) {
        case 'user': {
          return (
            <UserMessage
              actionsConfig={actionsBar?.user}
              disableEditing={disableEditing}
              id={id}
              index={index}
            />
          );
        }

        case 'assistant': {
          return (
            <AssistantMessage
              actionsConfig={actionsBar?.assistant}
              disableEditing={disableEditing}
              id={id}
              index={index}
              isLatestItem={isLatestItem}
            />
          );
        }

        case 'assistantGroup': {
          return (
            <AssistantGroupMessage
              actionsConfig={actionsBar?.assistantGroup ?? actionsBar?.assistant}
              disableEditing={disableEditing}
              id={id}
              index={index}
              isLatestItem={isLatestItem}
            />
          );
        }

        case 'tool': {
          return <ToolMessage id={id} index={index} />;
        }

        case 'supervisor': {
          return <SupervisorMessage disableEditing={disableEditing} id={id} index={index} />;
        }
      }

      return null;
    }, [role, disableEditing, id, index, isLatestItem, actionsBar]);

    if (!role) return;

    return (
      <>
        {enableHistoryDivider && <History />}
        <Flexbox
          className={cx(styles.message, className, isMessageCreating && styles.loading)}
          data-index={index}
          onContextMenu={onContextMenu}
          ref={setContainerRef}
        >
          {renderContent()}
          {endRender}
        </Flexbox>
        <ContextMenu
          id={id}
          inPortalThread={inPortalThread}
          index={index}
          onClose={hideContextMenu}
          position={contextMenuState.position}
          selectedText={contextMenuState.selectedText}
          topic={topic}
          virtuaRef={virtuaRef}
          visible={contextMenuState.visible}
        />
      </>
    );
  },
  isEqual,
);

MessageItem.displayName = 'MessageItem';

export default MessageItem;
