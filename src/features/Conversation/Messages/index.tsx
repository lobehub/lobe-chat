'use client';

import { UIChatMessage } from '@lobechat/types';
import { isDesktop } from '@lobechat/const';
import type { ActionIconGroupEvent, ActionIconGroupItemType } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { useSearchParams } from 'next/navigation';
import {
  MouseEvent,
  ReactNode,
  memo,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ContextMenu from '../components/ContextMenu';
import ShareMessageModal from '../components/ShareMessageModal';
import History from '../components/History';
import { InPortalThreadContext } from '../context/InPortalThreadContext';
import { useChatItemContextMenu } from '../hooks/useChatItemContextMenu';
import { useChatListActionsBar } from '../hooks/useChatListActionsBar';
import AssistantMessage from './Assistant';
import GroupMessage from './Group';
import SupervisorMessage from './Supervisor';
import ToolMessage from './Tool';
import UserMessage from './User';

import {
  VirtuaContext,
  removeVirtuaVisibleItem,
  upsertVirtuaVisibleItem,
} from '@/features/Conversation/components/VirtualizedList/VirtuosoContext';
import { getChatStoreState, useChatStore } from '@/store/chat';
import {
  displayMessageSelectors,
  messageStateSelectors,
  threadSelectors,
} from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

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
  isLatestItem?: boolean;
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
    isLatestItem,
  }) => {
    const { styles, cx } = useStyles();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const virtuaRef = use(VirtuaContext);
    const { message } = App.useApp();
    const { t } = useTranslation('common');
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic');
    const [shareMessage, setShareMessage] = useState<UIChatMessage | null>(null);
    const [isShareModalOpen, setShareModalOpen] = useState(false);

    const [
      isMessageLoading,
      role,
      error,
      editing,
      isThreadMode,
      hasThread,
      isRegenerating,
      isCollapsed,
    ] = useChatStore(
      (s) => {
        const item = displayMessageSelectors.getDisplayMessageById(id)(s);

        return [
          messageStateSelectors.isMessageLoading(id)(s),
          item?.role,
          item?.error,
          messageStateSelectors.isMessageEditing(id)(s),
          !!s.activeThreadId,
          threadSelectors.hasThreadBySourceMsgId(id)(s),
          messageStateSelectors.isMessageRegenerating(id)(s),
          messageStateSelectors.isMessageCollapsed(id)(s),
        ];
      },
      isEqual,
    );
    const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);
    const actionsBar = useChatListActionsBar({ hasThread, isRegenerating });
    const inThread = isThreadMode || inPortalThread;

    const menuItems = useMemo<MenuItemType[]>(() => {
      if (!role) return [];

      const {
        branching,
        collapse,
        copy,
        del,
        delAndRegenerate,
        divider,
        edit,
        expand,
        regenerate,
        share,
        translate,
        tts,
      } = actionsBar;

      if (role === 'assistant') {
        if (error) {
          return [edit, copy, divider, del, divider, regenerate].filter(Boolean) as MenuItemType[];
        }

        const collapseAction = isCollapsed ? expand : collapse;
        const list: MenuItemType[] = [edit, copy, collapseAction];

        if (!inThread && !isGroupSession) list.push(branching);

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

      if (role === 'user') {
        const list: MenuItemType[] = [edit, copy];

        if (!inThread) list.push(branching);

        list.push(divider, tts, translate, divider, regenerate, del);

        return list.filter(Boolean) as MenuItemType[];
      }

      return [];
    }, [actionsBar, error, inThread, isCollapsed, isGroupSession, role]);
    const hasMenuItems = menuItems.length > 0;

    const [
      toggleMessageEditing,
      deleteMessage,
      regenerateMessage,
      regenerateAssistantMessage,
      translateMessage,
      ttsMessage,
      delAndRegenerateMessage,
      copyMessage,
      openThreadCreator,
      resendThreadMessage,
      delAndResendThreadMessage,
    ] = useChatStore((s) => [
      s.toggleMessageEditing,
      s.deleteMessage,
      s.regenerateUserMessage,
      s.regenerateAssistantMessage,
      s.translateMessage,
      s.ttsMessage,
      s.delAndRegenerateMessage,
      s.copyMessage,
      s.openThreadCreator,
      s.resendThreadMessage,
      s.delAndResendThreadMessage,
    ]);

    const getMessage = useCallback(
      () => displayMessageSelectors.getDisplayMessageById(id)(getChatStoreState()),
      [id],
    );

    const handleShare = useCallback(() => {
      const item = getMessage();
      if (!item || item.role !== 'assistant') return;

      setShareMessage(item);
      setShareModalOpen(true);
    }, [getMessage]);
    const handleShareClose = useCallback(() => {
      setShareModalOpen(false);
      setShareMessage(null);
    }, []);

    const handleUserAction = useCallback(
      async (action: MenuActionEvent) => {
        const item = getMessage();
        if (!item) return;

        if (action.key === 'edit') {
          toggleMessageEditing(id, true);
          virtuaRef?.current?.scrollToIndex(index, { align: 'start' });
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
        getMessage,
        id,
        index,
        inPortalThread,
        message,
        openThreadCreator,
        regenerateMessage,
        resendThreadMessage,
        t,
        toggleMessageEditing,
        topic,
        translateMessage,
        ttsMessage,
        virtuaRef,
      ],
    );

    const handleAssistantAction = useCallback(
      async (action: MenuActionEvent) => {
        const item = getMessage();
        if (!item) return;

        if (action.key === 'edit') {
          toggleMessageEditing(id, true);
          virtuaRef?.current?.scrollToIndex(index, { align: 'start' });
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
              regenerateAssistantMessage(id);
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
            handleShare();
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
        getMessage,
        handleShare,
        id,
        index,
        inPortalThread,
        message,
        openThreadCreator,
        regenerateAssistantMessage,
        resendThreadMessage,
        t,
        toggleMessageEditing,
        topic,
        translateMessage,
        ttsMessage,
        virtuaRef,
      ],
    );

    const handleMenuAction = useCallback(
      (action: MenuActionEvent) => {
        if (role === 'assistant') return handleAssistantAction(action);
        if (role === 'user') return handleUserAction(action);
      },
      [handleAssistantAction, handleUserAction, role],
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
        containerRef.current = node;
        contextMenuContainerRef.current = node;
      },
      [contextMenuContainerRef],
    );

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

            upsertVirtuaVisibleItem(index, {
              bottom,
              ratio: entry.intersectionRatio,
              top,
            });
          } else {
            removeVirtuaVisibleItem(index);
          }
        });
      }, options);

      observer.observe(element);

      return () => {
        observer.disconnect();
        removeVirtuaVisibleItem(index);
      };
    }, [index]);

    const onContextMenu = useCallback(
      async (event: MouseEvent<HTMLDivElement>) => {
        if (!hasMenuItems) return;

        const item = getMessage();
        if (!item) return;

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
      [getMessage, handleContextMenu, hasMenuItems, id],
    );

    const renderContent = useMemo(() => {
      switch (role) {
        case 'user': {
          return <UserMessage disableEditing={disableEditing} id={id} index={index} />;
        }

        case 'assistant': {
          return (
            <AssistantMessage
              disableEditing={disableEditing}
              id={id}
              index={index}
              isLatestItem={isLatestItem}
              onShare={handleShare}
            />
          );
        }

        case 'assistantGroup': {
          return (
            <GroupMessage
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
    }, [role, disableEditing, handleShare, id, index, isLatestItem]);

    if (!role) return;

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
        {shareMessage && (
          <ShareMessageModal
            message={shareMessage}
            onCancel={handleShareClose}
            open={isShareModalOpen}
          />
        )}
      </InPortalThreadContext.Provider>
    );
  },
  isEqual,
);

Item.displayName = 'ChatItem';

export default Item;
