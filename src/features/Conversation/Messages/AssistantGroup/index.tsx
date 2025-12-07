'use client';

import { createStyles, useResponsive } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import { Avatar, BorderSpacing, Title } from '@/components/ChatItem';
import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors, builtinAgentSelectors } from '@/store/agent/selectors';
import { useGlobalStore } from '@/store/global';

import { useAgentMeta } from '../../hooks';
import { dataSelectors, messageStateSelectors, useConversationStore } from '../../store';
import type { MessageActionsConfig } from '../../types';
import Usage from '../components/Extras/Usage';
import { GroupActionsBar } from './Actions';
import EditState from './EditState';
import Group from './Group';

const MOBILE_AVATAR_SIZE = 32;

const useStyles = createStyles(
  ({ cx, css, token, responsive }, { variant }: { variant?: 'bubble' | 'docs' }) => {
    const rawContainerStylish = css`
      margin-block-end: -16px;
      transition: background-color 100ms ${token.motionEaseOut};
    `;

    return {
      actions: css`
        flex: none;
        align-self: flex-end;
        justify-content: flex-end;
      `,
      container: cx(
        variant === 'docs' && rawContainerStylish,
        css`
          position: relative;

          width: 100%;
          max-width: 100vw;
          padding-block: 24px 12px;
          padding-inline: 12px;

          @supports (content-visibility: auto) {
            contain-intrinsic-size: auto 100lvh;
          }

          time {
            display: inline-block;
            white-space: nowrap;
          }

          div[role='menubar'] {
            display: flex;
          }

          time,
          div[role='menubar'] {
            pointer-events: none;
            opacity: 0;
            transition: opacity 200ms ${token.motionEaseOut};
          }

          &:hover {
            time,
            div[role='menubar'] {
              pointer-events: unset;
              opacity: 1;
            }
          }

          ${responsive.mobile} {
            padding-block-start: ${variant === 'docs' ? '16px' : '12px'};
            padding-inline: 8px;
          }
        `,
      ),
      messageContent: css`
        position: relative;
        overflow: hidden;
        width: 100%;
        max-width: 100%;

        ${responsive.mobile} {
          flex-direction: column !important;
        }
      `,
    };
  },
);

interface GroupMessageProps {
  actionsConfig?: MessageActionsConfig;
  disableEditing?: boolean;
  id: string;
  index: number;
  isLatestItem?: boolean;
}

const GroupMessage = memo<GroupMessageProps>(
  ({ actionsConfig, id, index, disableEditing, isLatestItem }) => {
    // Get message from ConversationStore instead of ChatStore
    const item = useConversationStore(dataSelectors.getDisplayMessageById(id), isEqual)!;

    const { usage, createdAt, children, performance, model, provider } = item;
    const avatar = useAgentMeta();

    const { mobile } = useResponsive();
    const placement = 'left';
    const type = useAgentStore(agentChatConfigSelectors.displayMode);
    const variant = type === 'chat' ? 'bubble' : 'docs';

    const { styles } = useStyles({ variant });

    const isInbox = useAgentStore(builtinAgentSelectors.isInboxAgent);
    const [toggleSystemRole] = useGlobalStore((s) => [s.toggleSystemRole]);
    const openChatSettings = useOpenChatSettings();

    // Get the latest message block from the group that doesn't contain tools
    const lastAssistantMsg = useConversationStore(
      dataSelectors.getGroupLatestMessageWithoutTools(id),
    );

    const contentId = lastAssistantMsg?.id;

    // Get editing state from ConversationStore
    const isEditing = useConversationStore(messageStateSelectors.isMessageEditing(contentId || ''));

    const onAvatarClick = useCallback(() => {
      if (!isInbox) {
        toggleSystemRole(true);
      } else {
        openChatSettings();
      }
    }, [isInbox]);

    return (
      <Flexbox
        className={styles.container}
        gap={mobile ? 6 : 12}
        style={isLatestItem ? { minHeight: 'calc(-300px + 100dvh)' } : undefined}
      >
        <Flexbox gap={4} horizontal>
          <Avatar
            alt={avatar.title || 'avatar'}
            avatar={avatar}
            onClick={onAvatarClick}
            placement={placement}
            size={MOBILE_AVATAR_SIZE}
          />
          <Title
            avatar={avatar}
            placement={placement}
            showTitle
            style={{ marginBlockEnd: 0 }}
            time={createdAt}
          />
        </Flexbox>
        {isEditing && contentId ? (
          <EditState content={lastAssistantMsg?.content} id={contentId} />
        ) : (
          <Flexbox
            align={'flex-start'}
            className={styles.messageContent}
            data-layout={'vertical'}
            direction={'vertical'}
            gap={8}
            width={'100%'}
          >
            {children && children.length > 0 && (
              <Group
                blocks={children}
                content={lastAssistantMsg?.content}
                contentId={contentId}
                disableEditing={disableEditing}
                id={id}
                messageIndex={index}
              />
            )}

            {model && (
              <Usage model={model} performance={performance} provider={provider!} usage={usage} />
            )}
            {!disableEditing && (
              <Flexbox align={'flex-start'} role="menubar">
                <GroupActionsBar
                  actionsConfig={actionsConfig}
                  contentBlock={lastAssistantMsg}
                  contentId={contentId}
                  data={item}
                  id={id}
                  index={index}
                />
              </Flexbox>
            )}
          </Flexbox>
        )}

        {mobile && <BorderSpacing borderSpacing={MOBILE_AVATAR_SIZE} />}
      </Flexbox>
    );
  },
  isEqual,
);

export default GroupMessage;
