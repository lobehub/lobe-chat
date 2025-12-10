'use client';

import { ActionIcon, Block, Text } from '@lobehub/ui';
import { Popover } from 'antd';
import { createStyles } from 'antd-style';
import debug from 'debug';
import isEqual from 'fast-deep-equal';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { markdownToTxt } from 'markdown-to-txt';
import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { conversationSelectors, useConversationStore } from '@/features/Conversation';

const log = debug('lobe-react:chat-minimap');

const MIN_WIDTH = 12;
const MAX_WIDTH = 24;
const MAX_CONTENT_LENGTH = 320;
const MIN_MESSAGES = 3;

const useStyles = createStyles(({ css, token }) => ({
  arrow: css`
    opacity: 0;
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
    flex-shrink: 0;

    min-width: ${MIN_WIDTH}px;
    height: 12px;
    padding-block: 5px;
    padding-inline: 4px;
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
  popoverLabel: css`
    margin-block-end: 4px;
    font-size: 12px;
    font-weight: 600;
    color: ${token.colorTextSecondary};
  `,
  popoverText: css`
    color: ${token.colorText};
    word-break: break-word;
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
  railContent: css`
    scrollbar-width: none;

    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0;
    align-items: end;
    justify-content: space-between;

    max-height: round(down, 50vh, 12px);

    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none;

    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
      display: none;
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

  const plainText = markdownToTxt(content);
  const normalized = plainText.replaceAll(/\s+/g, ' ').trim();
  if (!normalized) return '';

  return normalized.slice(0, 100) + (normalized.length > 100 ? '…' : '');
};

interface MinimapIndicator {
  id: string;
  preview: string;
  role: 'user' | 'assistant';
  virtuosoIndex: number;
  width: number;
}

const ChatMinimap = memo(() => {
  const { t } = useTranslation('chat');
  const { styles, cx } = useStyles();
  const [isHovered, setIsHovered] = useState(false);

  const scrollMethods = useConversationStore(conversationSelectors.virtuaScrollMethods);
  const activeIndex = useConversationStore(conversationSelectors.activeIndex);
  const messages = useConversationStore(conversationSelectors.displayMessages, isEqual);

  const indicators = useMemo<MinimapIndicator[]>(() => {
    return messages.reduce<MinimapIndicator[]>((acc, message, virtuosoIndex) => {
      if (message.role !== 'user' && message.role !== 'assistant') return acc;

      acc.push({
        id: message.id,
        preview: getPreviewText(message.content),
        role: message.role,
        virtuosoIndex,
        width: getIndicatorWidth(message.content),
      });

      return acc;
    }, []);
  }, [messages]);

  const indicatorIndexMap = useMemo(() => {
    const map = new Map<number, number>();
    indicators.forEach(({ virtuosoIndex }, position) => {
      map.set(virtuosoIndex, position);
    });
    return map;
  }, [indicators]);

  const activeIndicatorPosition = useMemo(() => {
    if (activeIndex === null) return null;

    log('> activeIndex', activeIndex);
    log('> indicatorIndexMap', indicatorIndexMap);

    return indicatorIndexMap.get(activeIndex) ?? null;
  }, [activeIndex, indicatorIndexMap]);

  const handleJump = useCallback(
    (virtIndex: number) => {
      scrollMethods?.scrollToIndex(virtIndex, { align: 'start', smooth: true });
    },
    [scrollMethods],
  );

  const handleStep = useCallback(
    (direction: 'prev' | 'next') => {
      if (!scrollMethods || indicators.length === 0) return;

      let targetPosition: number;

      if (activeIndicatorPosition !== null) {
        log('activeIndicatorPosition', activeIndicatorPosition);
        // We're on an indicator, move to prev/next
        const delta = direction === 'prev' ? -1 : 1;
        targetPosition = Math.min(
          Math.max(activeIndicatorPosition + delta, 0),
          Math.max(indicators.length - 1, 0),
        );
      } else if (activeIndex !== null) {
        // We're not on an indicator, find the nearest one in the direction
        if (direction === 'prev') {
          let matched = -1;
          for (let pos = indicators.length - 1; pos >= 0; pos -= 1) {
            if (indicators[pos].virtuosoIndex < activeIndex) {
              matched = pos;
              break;
            }
          }
          targetPosition = matched === -1 ? 0 : matched;
        } else {
          let matched = indicators.length - 1;
          for (const [pos, indicator] of indicators.entries()) {
            if (indicator.virtuosoIndex > activeIndex) {
              matched = pos;
              break;
            }
          }
          targetPosition = matched;
        }
      } else {
        // No active index, go to first/last
        targetPosition = direction === 'prev' ? indicators.length - 1 : 0;
      }

      const targetIndicator = indicators[targetPosition];

      if (!targetIndicator) return;

      scrollMethods.scrollToIndex(targetIndicator.virtuosoIndex, { align: 'start', smooth: true });
    },
    [activeIndex, activeIndicatorPosition, indicators, scrollMethods],
  );

  if (indicators.length <= MIN_MESSAGES) return null;

  return (
    <Flexbox align={'center'} className={styles.container} justify={'center'}>
      <Flexbox
        className={styles.rail}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role={'group'}
      >
        <ActionIcon
          aria-label={t('minimap.previousMessage')}
          className={cx(styles.arrow, isHovered && styles.arrowVisible)}
          icon={ChevronUp}
          onClick={() => handleStep('prev')}
          size={14}
        />
        <Flexbox className={styles.railContent}>
          {indicators.map(({ id, width, preview, role, virtuosoIndex }, position) => {
            const isActive = activeIndicatorPosition === position;
            const senderLabel =
              role === 'user' ? t('minimap.senderUser') : t('minimap.senderAssistant');
            const popoverContent = preview ? (
              <>
                <Text fontSize={12} style={{ marginBottom: 4 }} type={'secondary'} weight={500}>
                  {senderLabel}
                </Text>
                <Text as={'p'} fontSize={12}>
                  {preview}
                </Text>
              </>
            ) : undefined;
            return (
              <Popover
                arrow={false}
                content={popoverContent}
                key={id}
                mouseEnterDelay={0.1}
                placement={'left'}
                styles={{
                  body: {
                    width: 320,
                  },
                }}
              >
                <Block
                  align={'flex-end'}
                  clickable
                  style={{ borderRadius: 4 }}
                  variant={'borderless'}
                  width={'100%'}
                >
                  <div
                    aria-current={isActive ? 'true' : undefined}
                    aria-label={t('minimap.jumpToMessage', { index: position + 1 })}
                    className={styles.indicator}
                    onClick={() => handleJump(virtuosoIndex)}
                    style={{ width }}
                  >
                    <div
                      className={cx(
                        styles.indicatorContent,
                        isActive && styles.indicatorContentActive,
                      )}
                    />
                  </div>
                </Block>
              </Popover>
            );
          })}
        </Flexbox>
        <ActionIcon
          aria-label={t('minimap.nextMessage')}
          className={cx(styles.arrow, isHovered && styles.arrowVisible)}
          icon={ChevronDown}
          onClick={() => handleStep('next')}
          size={14}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default ChatMinimap;
