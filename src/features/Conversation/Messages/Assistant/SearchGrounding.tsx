import { Icon, SearchResultCards, Tag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Globe } from 'lucide-react';
import Image from 'next/image';
import { rgba } from 'polished';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { GroundingSearch } from '@/types/search';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  container: css`
    width: fit-content;
    padding-block: 4px;
    padding-inline: 8px;
    border-radius: 6px;

    color: ${token.colorTextTertiary};

    &:hover {
      background: ${isDarkMode ? token.colorFillQuaternary : token.colorFillTertiary};
    }
  `,
  expand: css`
    background: ${isDarkMode ? token.colorFillQuaternary : token.colorFillTertiary} !important;
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

const SearchGrounding = memo<GroundingSearch>(({ searchQueries, citations }) => {
  const { t } = useTranslation('chat');
  const { styles, cx, theme } = useStyles();

  const [showDetail, setShowDetail] = useState(false);

  return (
    <Flexbox
      className={cx(styles.container, showDetail && styles.expand)}
      gap={16}
      style={{ width: showDetail ? '100%' : undefined }}
    >
      <Flexbox
        distribution={'space-between'}
        flex={1}
        gap={8}
        horizontal
        onClick={() => {
          setShowDetail(!showDetail);
        }}
        style={{ cursor: 'pointer' }}
      >
        <Flexbox align={'center'} gap={8} horizontal>
          <Icon icon={Globe} />
          <Flexbox horizontal>{t('search.grounding.title', { count: citations?.length })}</Flexbox>
          {!showDetail && (
            <Flexbox horizontal>
              {citations?.slice(0, 8).map((item, index) => (
                <Image
                  alt={item.title || item.url}
                  height={16}
                  key={`${item.url}-${index}`}
                  src={`https://icons.duckduckgo.com/ip3/${new URL(item.url).host}.ico`}
                  style={{
                    background: theme.colorBgContainer,
                    borderRadius: 8,
                    marginInline: -2,
                    padding: 2,
                    zIndex: 100 - index,
                  }}
                  unoptimized
                  width={16}
                />
              ))}
            </Flexbox>
          )}
        </Flexbox>

        <Flexbox gap={4} horizontal>
          <Icon icon={showDetail ? ChevronDown : ChevronRight} />
        </Flexbox>
      </Flexbox>

      <AnimatePresence initial={false}>
        {showDetail && (
          <motion.div
            animate="open"
            exit="collapsed"
            initial="collapsed"
            style={{ overflow: 'hidden', width: '100%' }}
            transition={{
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1], // 使用 ease-out 缓动函数
            }}
            variants={{
              collapsed: { height: 0, opacity: 0, width: 'auto' },
              open: { height: 'auto', opacity: 1, width: 'auto' },
            }}
          >
            <Flexbox gap={12}>
              {searchQueries && (
                <Flexbox gap={4} horizontal>
                  {t('search.grounding.searchQueries')}
                  <Flexbox gap={8} horizontal>
                    {searchQueries.map((query, index) => (
                      <Tag key={index}>{query}</Tag>
                    ))}
                  </Flexbox>
                </Flexbox>
              )}
              {citations && <SearchResultCards dataSource={citations} />}
            </Flexbox>
          </motion.div>
        )}
      </AnimatePresence>
    </Flexbox>
  );
});

export default SearchGrounding;
