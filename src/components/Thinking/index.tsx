import { ActionIcon, CopyButton, Icon, Markdown } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { AnimatePresence, motion } from 'framer-motion';
import { AtomIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { rgba } from 'polished';
import { CSSProperties, memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { CitationItem } from '@/types/message';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow: hidden;
    border-radius: ${token.borderRadius}px;
    color: ${token.colorTextTertiary};
    transition: all 0.2s ${token.motionEaseOut};
  `,
  expand: css`
    color: ${token.colorTextSecondary};
    background: ${token.colorFillTertiary};
  `,

  header: css`
    padding-block: 4px;
    padding-inline: 8px 4px;
    transition: background 0.2s ${token.motionEaseOut};
    transition: all 0.2s ${token.motionEaseOut};

    &:hover {
      background: ${token.colorFillQuaternary};
    }
  `,

  headerExpand: css`
    color: ${token.colorTextSecondary};
    background: ${token.colorFillQuaternary};
  `,
  shinyText: css`
    color: ${rgba(token.colorText, 0.45)};

    background: linear-gradient(
      120deg,
      ${rgba(token.colorTextBase, 0)} 40%,
      ${token.colorTextSecondary} 50%,
      ${rgba(token.colorTextBase, 0)} 60%
    );
    background-clip: text;
    background-size: 200% 100%;

    animation: shine 1.5s linear infinite;

    @keyframes shine {
      0% {
        background-position: 100%;
      }

      100% {
        background-position: -100%;
      }
    }
  `,
  title: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    font-size: 12px;
    text-overflow: ellipsis;
  `,
}));

interface ThinkingProps {
  citations?: CitationItem[];
  content?: string;
  duration?: number;
  style?: CSSProperties;
  thinking?: boolean;
}

const Thinking = memo<ThinkingProps>(({ content, duration, thinking, style, citations }) => {
  const { t } = useTranslation(['components', 'common']);
  const { styles, cx, theme } = useStyles();

  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    setShowDetail(!!thinking);
  }, [thinking]);

  return (
    <Flexbox
      className={cx(styles.container, showDetail && styles.expand)}
      style={style}
      width={'100%'}
    >
      <Flexbox
        className={cx(styles.header, showDetail && styles.headerExpand)}
        distribution={'space-between'}
        flex={1}
        gap={8}
        horizontal
        onClick={() => {
          setShowDetail(!showDetail);
        }}
        style={{ cursor: 'pointer' }}
        width={'100%'}
      >
        {thinking ? (
          <Flexbox align={'center'} gap={8} horizontal width={'100%'}>
            <Icon color={theme.purple} icon={AtomIcon} />
            <Flexbox className={styles.shinyText} horizontal>
              {t('Thinking.thinking')}
            </Flexbox>
          </Flexbox>
        ) : (
          <Flexbox align={'center'} gap={8} horizontal width={'100%'}>
            <Icon color={showDetail ? theme.purple : undefined} icon={AtomIcon} />
            <Flexbox>
              {!duration
                ? t('Thinking.thoughtWithDuration')
                : t('Thinking.thought', { duration: ((duration || 0) / 1000).toFixed(1) })}
            </Flexbox>
          </Flexbox>
        )}
        <Flexbox gap={4} horizontal>
          {showDetail && content && (
            <div
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              <CopyButton content={content} size={'small'} title={t('copy', { ns: 'common' })} />
            </div>
          )}
          <ActionIcon icon={showDetail ? ChevronDown : ChevronRight} size={'small'} />
        </Flexbox>
      </Flexbox>
      <AnimatePresence initial={false}>
        {showDetail && (
          <motion.div
            animate="open"
            exit="collapsed"
            initial="collapsed"
            style={{ overflow: 'hidden', padding: 12 }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1], // 使用 ease-out 缓动函数
            }}
            variants={{
              collapsed: { opacity: 0, width: 'auto' },
              open: { opacity: 1, width: 'auto' },
            }}
          >
            {typeof content === 'string' ? (
              <Markdown animated={thinking} citations={citations} variant={'chat'}>
                {content}
              </Markdown>
            ) : (
              content
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Flexbox>
  );
});

export default Thinking;
