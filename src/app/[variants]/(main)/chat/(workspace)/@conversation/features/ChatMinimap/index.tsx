'use client';

import { Icon } from '@lobehub/ui';
import { Tooltip } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { memo, useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import {
  getVirtuosoActiveIndex,
  getVirtuosoGlobalRef,
  subscribeVirtuosoActiveIndex,
  subscribeVirtuosoGlobalRef,
} from '@/features/Conversation/components/VirtualizedList/VirtuosoContext';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

const MIN_WIDTH = 16;
const MAX_WIDTH = 30;
const MAX_CONTENT_LENGTH = 320;
const MIN_MESSAGES = 6;

const useStyles = createStyles(({ css, token }) => ({
  arrow: css`
    cursor: pointer;

    transform: translateX(4px);

    display: flex;
    align-items: center;
    justify-content: center;

    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 6px;

    color: ${token.colorTextTertiary};

    opacity: 0;
    background: none;

    transition: opacity 0.2s ease;

    &:hover {
      color: ${token.colorText};
      background: ${token.colorFill};
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px ${token.colorPrimaryBorder};
    }
  `,
  arrowVisible: css`
    opacity: 1;
  `,
  container: css`
    pointer-events: none;

    position: absolute;
    z-index: 1;
    inset-block: 16px 120px;
    inset-inline-end: 8px;

    width: 32px;
  `,
  indicator: css`
    cursor: pointer;

    flex-shrink: 0;

    min-width: ${MIN_WIDTH}px;
    height: 12px;
    padding-block: 4px;
    padding-inline: 4px;
    border: none;
    border-radius: 3px;

    background: none;

    transition:
      transform 0.2s ease,
      background-color 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      transform: scaleX(1.05);
      background: ${token.colorFill};
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px ${token.colorPrimaryBorder};
    }
  `,
  indicatorActive: css`
    transform: scaleX(1.1);
    background: ${token.colorPrimary};
    box-shadow: 0 0 0 1px ${token.colorPrimaryHover};
  `,
  indicatorContent: css`
    width: 100%;
    height: 100%;
    border-radius: 3px;
    background: ${token.colorFillSecondary};
  `,
  indicatorContentActive: css`
    background: ${token.colorPrimary};
  `,
  rail: css`
    pointer-events: auto;

    display: flex;
    flex-direction: column;
    gap: 0;
    align-items: end;
    justify-content: space-between;

    width: 100%;
    height: fit-content;
    margin-block: 0;
    margin-inline: auto;

    &:hover .arrow {
      opacity: 1;
    }
  `,
}));

const getIndicatorWidth = (content: string | undefined) => {
  if (!content) return MIN_WIDTH;

  const ratio = Math.min(content.length / MAX_CONTENT_LENGTH, 1);

  return MIN_WIDTH + (MAX_WIDTH - MIN_WIDTH) * ratio;
};

const getPreviewText = (content: string | undefined) => {
  if (!content) return '';

  const normalized = content.replaceAll(/\s+/g, ' ').trim();
  if (!normalized) return '';

  return normalized.slice(0, 100) + (normalized.length > 100 ? '…' : '');
};

const ChatMinimap = () => {
  const { t } = useTranslation('chat');
  const { styles, cx } = useStyles();
  const [isHovered, setIsHovered] = useState(false);
  const virtuosoRef = useSyncExternalStore(
    subscribeVirtuosoGlobalRef,
    getVirtuosoGlobalRef,
    () => null,
  );
  const activeIndex = useSyncExternalStore(
    subscribeVirtuosoActiveIndex,
    getVirtuosoActiveIndex,
    () => null,
  );
  const messages = useChatStore(chatSelectors.mainDisplayChats).filter(
    (message) => message.role === 'user' || message.role === 'assistant',
  );

  const theme = useTheme();

  const indicators = useMemo(
    () =>
      messages.map((message, index) => ({
        id: message.id,
        index,
        preview: getPreviewText(message.content),
        width: getIndicatorWidth(message.content),
      })),
    [messages],
  );

  const handleJump = useCallback(
    (index: number) => {
      virtuosoRef?.current?.scrollIntoView({
        align: 'center',
        behavior: 'smooth',
        index,
      });
    },
    [virtuosoRef],
  );

  const handleStep = useCallback(
    (direction: 'prev' | 'next') => {
      const ref = virtuosoRef?.current;
      if (!ref) return;

      const baseIndex = (() => {
        if (activeIndex !== null) return activeIndex;

        return direction === 'prev' ? 0 : Math.max(messages.length - 1, 0);
      })();
      const delta = direction === 'prev' ? -1 : 1;
      const targetIndex = Math.min(
        Math.max(baseIndex + delta, 0),
        Math.max(messages.length - 1, 0),
      );

      if (targetIndex === baseIndex) return;

      ref.scrollIntoView({
        align: 'center',
        behavior: 'smooth',
        index: targetIndex,
      });
    },
    [activeIndex, messages.length, virtuosoRef],
  );

  if (messages.length <= MIN_MESSAGES) return null;

  return (
    <Flexbox align={'center'} className={styles.container} justify={'center'}>
      <Flexbox
        className={styles.rail}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role={'group'}
      >
        <Tooltip mouseEnterDelay={0.1} placement={'left'} title={t('minimap.previousMessage')}>
          <button
            aria-label={t('minimap.previousMessage')}
            className={cx(styles.arrow, isHovered && styles.arrowVisible)}
            onClick={() => handleStep('prev')}
            type={'button'}
          >
            <Icon color={theme.colorTextTertiary} icon={ChevronUp} size={16} />
          </button>
        </Tooltip>
        {indicators.map(({ id, index, width, preview }) => {
          const isActive = activeIndex === index;

          return (
            <Tooltip key={id} mouseEnterDelay={0.1} placement={'left'} title={preview || undefined}>
              <button
                aria-current={isActive ? 'true' : undefined}
                aria-label={`Jump to message ${index + 1}`}
                className={styles.indicator}
                onClick={() => handleJump(index)}
                style={{
                  width,
                }}
                type={'button'}
              >
                <div
                  className={cx(styles.indicatorContent, isActive && styles.indicatorContentActive)}
                />
              </button>
            </Tooltip>
          );
        })}
        <Tooltip mouseEnterDelay={0.1} placement={'left'} title={t('minimap.nextMessage')}>
          <button
            aria-label={t('minimap.nextMessageAriaLabel')}
            className={cx(styles.arrow, isHovered && styles.arrowVisible)}
            onClick={() => handleStep('next')}
            type={'button'}
          >
            <Icon icon={ChevronDown} size={16} />
          </button>
        </Tooltip>
      </Flexbox>
    </Flexbox>
  );
};

export default memo(ChatMinimap);
