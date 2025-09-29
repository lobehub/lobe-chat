'use client';

import { Icon } from '@lobehub/ui';
import { Tooltip } from 'antd';
import { createStyles, useTheme } from 'antd-style';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { memo, useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { Flexbox } from 'react-layout-kit';

import {
  getVirtuosoGlobalRef,
  getVirtuosoViewportRange,
  subscribeVirtuosoGlobalRef,
  subscribeVirtuosoViewportRange,
} from '@/features/Conversation/components/VirtualizedList/VirtuosoContext';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

const MIN_WIDTH = 12;
const MAX_WIDTH = 28;
const MAX_CONTENT_LENGTH = 320;

const useStyles = createStyles(({ css, token }) => ({
  arrow: css`
    align-items: center;
    border: none;
    background: none;
    color: ${token.colorTextTertiary};
    cursor: pointer;
    display: flex;
    height: 28px;
    justify-content: center;
    padding: 0;
    width: 28px;
    opacity: 0;
    transform: translateX(8px);
    transition: opacity 0.2s ease;

    &:hover {
      color: ${token.colorText};
    }

    &:focus-visible {
      box-shadow: 0 0 0 2px ${token.colorPrimaryBorder};
      outline: none;
    }
  `,
  arrowVisible: css`
    opacity: 1;
  `,
  container: css`
    pointer-events: none;
    inset-block-start: 16px;
    inset-block-end: 120px;
    inset-inline-end: 16px;
    position: absolute;
    width: 32px;
    z-index: 1;
  `,
  indicator: css`
    background: none;
    border: none;
    border-radius: 3px;
    cursor: pointer;
    flex-shrink: 0;
    height: 12px;
    min-width: ${MIN_WIDTH}px;
    padding: 4px 2px;
    transition:
      transform 0.2s ease,
      background-color 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      background: ${token.colorFill};
      transform: scaleX(1.05);
    }

    &:focus-visible {
      box-shadow: 0 0 0 2px ${token.colorPrimaryBorder};
      outline: none;
    }
  `,
  indicatorActive: css`
    background: ${token.colorPrimary};
    box-shadow: 0 0 0 1px ${token.colorPrimaryHover};
    transform: scaleX(1.1);
  `,
  indicatorContent: css`
    background: ${token.colorFillSecondary};
    border-radius: 3px;
    height: 100%;
    width: 100%;
  `,
  indicatorContentActive: css`
    background: ${token.colorPrimary};
  `,
  rail: css`
    align-items: end;
    display: flex;
    flex-direction: column;
    gap: 0px;
    width: 100%;
    height: fit-content;
    justify-content: space-between;
    margin: 0 auto;
    pointer-events: auto;

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
  const { styles, cx } = useStyles();
  const [isHovered, setIsHovered] = useState(false);
  const virtuosoRef = useSyncExternalStore(
    subscribeVirtuosoGlobalRef,
    getVirtuosoGlobalRef,
    () => null,
  );
  const viewportRange = useSyncExternalStore(
    subscribeVirtuosoViewportRange,
    getVirtuosoViewportRange,
    () => null,
  );
  const messages = useChatStore(chatSelectors.mainDisplayChats);

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

  const activeIndex = useMemo(() => {
    if (!viewportRange) return null;

    const index = Math.min(viewportRange.endIndex, Math.max(messages.length - 1, 0));

    return Number.isFinite(index) ? index : null;
  }, [messages.length, viewportRange]);

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

  if (messages.length <= 4) return null;

  return (
    <Flexbox align={'center'} className={styles.container} justify={'center'}>
      <Flexbox
        className={styles.rail}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role={'group'}
      >
        <Tooltip mouseEnterDelay={0.1} placement={'left'} title={'Previous message'}>
          <button
            aria-label={'Jump to previous message'}
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
        <Tooltip mouseEnterDelay={0.1} placement={'left'} title={'Next message'}>
          <button
            aria-label={'Jump to next message'}
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
