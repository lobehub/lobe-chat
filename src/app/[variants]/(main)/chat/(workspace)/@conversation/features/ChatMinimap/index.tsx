'use client';

import { Icon } from '@lobehub/ui';
import { Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useCallback, useMemo, useSyncExternalStore } from 'react';
import { Flexbox } from 'react-layout-kit';
import { ChevronDown, ChevronUp } from 'lucide-react';

import {
  getVirtuosoGlobalRef,
  getVirtuosoViewportRange,
  subscribeVirtuosoGlobalRef,
  subscribeVirtuosoViewportRange,
} from '@/features/Conversation/components/VirtualizedList/VirtuosoContext';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

const MIN_WIDTH = 8;
const MAX_WIDTH = 28;
const MAX_CONTENT_LENGTH = 320;

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    pointer-events: none;
    inset-block-start: 16px;
    inset-block-end: 120px;
    inset-inline-end: 12px;
    position: absolute;
    width: 36px;
    z-index: 1;
  `,
  indicator: css`
    background: ${token.colorFillSecondary};
    border: none;
    border-radius: 4px;
    cursor: pointer;
    height: 8px;
    min-width: ${MIN_WIDTH}px;
    padding: 0;
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
  arrow: css`
    align-items: center;
    background: ${token.colorFillSecondary};
    border: none;
    border-radius: 999px;
    color: ${token.colorTextTertiary};
    cursor: pointer;
    display: flex;
    height: 28px;
    justify-content: center;
    padding: 0;
    transition:
      transform 0.2s ease,
      background-color 0.2s ease,
      box-shadow 0.2s ease,
      color 0.2s ease;
    width: 28px;

    &:hover {
      background: ${token.colorFill};
      color: ${token.colorText};
      transform: scale(1.05);
    }

    &:focus-visible {
      box-shadow: 0 0 0 2px ${token.colorPrimaryBorder};
      outline: none;
    }
  `,
  rail: css`
    align-items: end;
    border-radius: 999px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    height: min(100%, 320px);
    justify-content: space-between;
    margin: 0 auto;
    padding: 12px 6px;
    pointer-events: auto;
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
      const targetIndex = Math.min(Math.max(baseIndex + delta, 0), Math.max(messages.length - 1, 0));

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
      <Flexbox className={styles.rail} role={'group'}>
        <Tooltip mouseEnterDelay={0.1} placement={'left'} title={'Previous message'}>
          <button
            aria-label={'Jump to previous message'}
            className={styles.arrow}
            onClick={() => handleStep('prev')}
            type={'button'}
          >
            <Icon icon={ChevronUp} />
          </button>
        </Tooltip>
        {indicators.map(({ id, index, width, preview }) => {
          const isActive = activeIndex === index;

          return (
            <Tooltip key={id} mouseEnterDelay={0.1} placement={'left'} title={preview || undefined}>
              <button
                aria-label={`Jump to message ${index + 1}`}
                aria-current={isActive ? 'true' : undefined}
                className={cx(styles.indicator, isActive && styles.indicatorActive)}
                onClick={() => handleJump(index)}
                style={{
                  width,
                }}
                type={'button'}
              />
            </Tooltip>
          );
        })}
        <Tooltip mouseEnterDelay={0.1} placement={'left'} title={'Next message'}>
          <button
            aria-label={'Jump to next message'}
            className={styles.arrow}
            onClick={() => handleStep('next')}
            type={'button'}
          >
            <Icon icon={ChevronDown} />
          </button>
        </Tooltip>
      </Flexbox>
    </Flexbox>
  );
};

export default memo(ChatMinimap);
