import { Icon, Markdown } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { AtomIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  container: css`
    cursor: pointer;

    padding-block: 8px;
    padding-inline: 12px;
    padding-inline-end: 12px;
    border-radius: 8px;

    color: ${token.colorText};

    background: ${token.colorFillTertiary};

    &:hover {
      background: ${isDarkMode ? '' : token.colorFillSecondary};
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
  content?: string;
  duration?: number;
}

const Thinking = memo<ThinkingProps>(({ content = '' }) => {
  const { t } = useTranslation('chat');
  const { styles, theme } = useStyles();

  const [showDetail, setShowDetail] = useState(false);

  return (
    <Flexbox
      className={styles.container}
      gap={16}
      onClick={() => {
        setShowDetail(!showDetail);
      }}
      width={'100%'}
    >
      <Flexbox distribution={'space-between'} flex={1} horizontal>
        <Flexbox gap={8} horizontal>
          <Icon color={theme.geekblue} icon={AtomIcon} /> {t('reasoning.thought')}
        </Flexbox>
        <Icon icon={showDetail ? ChevronDown : ChevronRight} />
      </Flexbox>

      {showDetail && (
        <Flexbox>
          <Markdown variant={'chat'}>{content}</Markdown>
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default Thinking;
