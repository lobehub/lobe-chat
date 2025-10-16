'use client';

import type { ActionIconGroupEvent, ActionIconGroupItemType } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { useSearchParams } from 'next/navigation';
import { ReactNode, memo, use, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { isDesktop } from '@/const/version';
import {
  VirtuosoContext,
  removeVirtuosoVisibleItem,
  upsertVirtuosoVisibleItem,
} from '@/features/Conversation/components/VirtualizedList/VirtuosoContext';
import { useChatStore } from '@/store/chat';
import { chatSelectors, threadSelectors } from '@/store/chat/selectors';

import ContextMenu from '../components/ContextMenu';
import History from '../components/History';
import ShareMessageModal from '../components/ShareMessageModal';
import { InPortalThreadContext } from '../context/InPortalThreadContext';
import { useChatItemContextMenu } from '../hooks/useChatItemContextMenu';
import { useChatListActionsBar } from '../hooks/useChatListActionsBar';
import AssistantMessage from './Assistant';
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

type MenuItemType = ActionIconGroupItemType | { type: 'divider' };
type MenuActionEvent = ActionIconGroupEvent & { selectedText?: string };

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
    const intersectionRef = useRef<HTMLDivElement | null>(null);
    const { message } = App.useApp();
    const { t } = useTranslation('common');
    const searchParams = useSearchParams();

    const item = useChatStore(chatSelectors.getMessageById(id), isEqual);

    const [isMessageLoading] = useChatStore((s) => [chatSelectors.isMessageLoading(id)(s)]);
    const editing = useChatStore((s) => chatSelectors.isMessageEditing(id)(s));
    const [
      isThreadMode,
      hasThread,
      toggleMessageEditing,
      deleteMessage,
      regenerateMessage,
      translateMessage,
      ttsMessage,
      delAndRegenerateMessage,
      copyMessage,
      openThreadCreator,
      resendThreadMessage,
      delAndResendThreadMessage,
    ] = useChatStore((s) => [
      !!s.activeThreadId,
      threadSelectors.hasThreadBySourceMsgId(id)(s),
      s.toggleMessageEditing,
      s.deleteMessage,
      s.regenerateMessage,
      s.translateMessage,
      s.ttsMessage,
      s.delAndRegenerateMessage,
      s.copyMessage,
      s.openThreadCreator,
      s.resendThreadMessage,
      s.delAndResendThreadMessage,
    ]);

    const virtuosoRef = use(VirtuosoContext);
    const topic = searchParams.get('topic');
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const actionsBar = useChatListActionsBar({ hasThread });
    const inThread = isThreadMode || inPortalThread;
    const menuItems = useMemo<MenuItemType[]>(() => {
      if (!item) return [];

      const {
        branching,
        copy,
        del,
        delAndRegenerate,
        divider,
        edit,
        regenerate,
        share,
        translate,
        tts,
      } = actionsBar;

      if (item.role === 'assistant') {
        if (item.error) {
          return [edit, copy, divider, del, divider, regenerate].filter(Boolean) as MenuItemType[];
        }

        const list: MenuItemType[] = [edit, copy];

        if (!inThread) list.push(branching);

        list.push(
          divider,
          tts,
          translate,
          divider,
          share,
          divider,
          regenerate,
          delAndRegenerate,
          del,
        );

        return list.filter(Boolean) as MenuItemType[];
      }

      if (item.role === 'user') {
        const list: MenuItemType[] = [edit, copy];

        if (!inThread) list.push(branching);

        list.push(divider, tts, translate, divider, regenerate, del);

        return list.filter(Boolean) as MenuItemType[];
      }

      return [];
    }, [actionsBar, inThread, item]);
    const hasMenuItems = menuItems.length > 0;

    const handleUserAction = useCallback(
      async (action: MenuActionEvent) => {
        if (!item) return;

        if (action.key === 'edit') {
          toggleMessageEditing(id, true);
          virtuosoRef?.current?.scrollIntoView({ align: 'start', behavior: 'auto', index });
        }

        switch (action.key) {
          case 'copy': {
            await copyMessage(id, item.content);
            message.success(t('copySuccess'));
            break;
          }
          case 'branching': {
            if (!topic) {
              message.warning(t('branchingRequiresSavedTopic'));
              break;
            }
            openThreadCreator(id);
            break;
          }
          case 'del': {
            deleteMessage(id);
            break;
          }
          case 'regenerate': {
            if (inPortalThread) {
              resendThreadMessage(id);
            } else {
              regenerateMessage(id);
            }

            if (item.error) deleteMessage(id);
            break;
          }
          case 'delAndRegenerate': {
            if (inPortalThread) {
              delAndResendThreadMessage(id);
            } else {
              delAndRegenerateMessage(id);
            }
            break;
          }
          case 'tts': {
            ttsMessage(id);
            break;
          }
        }

        if (action.keyPath?.at(-1) === 'translate') {
          const lang = action.keyPath[0];
          translateMessage(id, lang);
        }
      },
      [
        copyMessage,
        deleteMessage,
        delAndRegenerateMessage,
        delAndResendThreadMessage,
        id,
        index,
        inPortalThread,
        item,
        message,
        openThreadCreator,
        regenerateMessage,
        resendThreadMessage,
        t,
        toggleMessageEditing,
        topic,
        translateMessage,
        ttsMessage,
        virtuosoRef,
      ],
    );

    const handleAssistantAction = useCallback(
      async (action: MenuActionEvent) => {
        if (!item) return;

        if (action.key === 'edit') {
          toggleMessageEditing(id, true);
          virtuosoRef?.current?.scrollIntoView({ align: 'start', behavior: 'auto', index });
        }

        switch (action.key) {
          case 'copy': {
            await copyMessage(id, item.content);
            message.success(t('copySuccess', { defaultValue: 'Copy Success' }));
            break;
          }
          case 'branching': {
            if (!topic) {
              message.warning(t('branchingRequiresSavedTopic'));
              break;
            }
            openThreadCreator(id);
            break;
          }
          case 'del': {
            deleteMessage(id);
            break;
          }
          case 'regenerate': {
            if (inPortalThread) {
              resendThreadMessage(id);
            } else {
              regenerateMessage(id);
            }

            if (item.error) deleteMessage(id);
            break;
          }
          case 'delAndRegenerate': {
            if (inPortalThread) {
              delAndResendThreadMessage(id);
            } else {
              delAndRegenerateMessage(id);
            }
            break;
          }
          case 'tts': {
            ttsMessage(id);
            break;
          }
          case 'share': {
            setShareModalOpen(true);
            break;
          }
        }

        if (action.keyPath?.at(-1) === 'translate') {
          const lang = action.keyPath[0];
          translateMessage(id, lang);
        }
      },
      [
        copyMessage,
        deleteMessage,
        delAndRegenerateMessage,
        delAndResendThreadMessage,
        id,
        index,
        inPortalThread,
        item,
        message,
        openThreadCreator,
        regenerateMessage,
        resendThreadMessage,
        t,
        toggleMessageEditing,
        topic,
        translateMessage,
        ttsMessage,
        setShareModalOpen,
        virtuosoRef,
      ],
    );

    const handleMenuAction = useCallback(
      (action: MenuActionEvent) => {
        if (!item) return;

        if (item.role === 'assistant') {
          return handleAssistantAction(action);
        }

        if (item.role === 'user') {
          return handleUserAction(action);
        }
      },
      [handleAssistantAction, handleUserAction, item],
    );

    const {
      containerRef: contextMenuContainerRef,
      contextMenuState,
      handleContextMenu,
      handleMenuClick: handleContextMenuItemClick,
    } = useChatItemContextMenu({
      editing,
      onActionClick: handleMenuAction,
    });

    const setContainerRef = useCallback(
      (node: HTMLDivElement | null) => {
        intersectionRef.current = node;
        contextMenuContainerRef.current = node;
      },
      [contextMenuContainerRef],
    );
    const handleShare = useCallback(() => {
      setShareModalOpen(true);
    }, [setShareModalOpen]);

    // ======================= Performance Optimization ======================= //
    // these useMemo/useCallback are all for the performance optimization
    // maybe we can remove it in React 19
    // ======================================================================== //

    useEffect(() => {
      if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

      const element = intersectionRef.current;
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

    const onContextMenu = useCallback(
      async (event: MouseEvent<HTMLDivElement>) => {
        if (!item || !hasMenuItems) return;

        if (isDesktop) {
          const { electronSystemService } = await import('@/services/electron/system');

          electronSystemService.showContextMenu('chat', {
            content: item.content,
            hasError: !!item.error,
            messageId: id,
            role: item.role,
          });

          return;
        }

        handleContextMenu(event);
      },
      [handleContextMenu, hasMenuItems, id, item],
    );

    const renderContent = useMemo(() => {
      if (!item) return null;

      if (item.role === 'user') {
        return <UserMessage {...item} disableEditing={disableEditing} index={index} />;
      }

      if (item.role === 'assistant') {
        return (
          <AssistantMessage
            {...item}
            disableEditing={disableEditing}
            index={index}
            onShare={handleShare}
          />
        );
      }

      return null;
    }, [disableEditing, handleShare, index, item]);

    if (!item) return;

    return (
      <InPortalThreadContext.Provider value={inPortalThread}>
        {enableHistoryDivider && <History />}
        <Flexbox
          className={cx(styles.message, className, isMessageLoading && styles.loading)}
          data-index={index}
          onContextMenu={onContextMenu}
          ref={setContainerRef}
        >
          {renderContent}
          {endRender}
        </Flexbox>
        <ContextMenu
          items={menuItems}
          onMenuClick={handleContextMenuItemClick}
          position={contextMenuState.position}
          selectedText={contextMenuState.selectedText}
          visible={contextMenuState.visible}
        />
        {item.role === 'assistant' && (
          <ShareMessageModal
            message={item}
            onCancel={() => setShareModalOpen(false)}
            open={isShareModalOpen}
          />
        )}
      </InPortalThreadContext.Provider>
    );
  },
);

Item.displayName = 'ChatItem';

export default Item;
