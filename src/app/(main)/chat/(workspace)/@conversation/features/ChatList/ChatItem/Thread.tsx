import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { CSSProperties, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { threadSelectors } from '@/store/chat/selectors';

import ThreadItem from './ThreadItem';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  container: css`
    cursor: pointer;

    padding-block: 8px 4px;
    padding-inline: 4px;

    background: ${isDarkMode ? token.colorFillTertiary : token.colorFillQuaternary};
    border-radius: 6px;
  `,
}));

interface ThreadProps {
  id: string;
  placement: 'start' | 'end';
  style?: CSSProperties;
}

const Thread = memo<ThreadProps>(({ id, placement, style }) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();

  const threads = useChatStore(threadSelectors.getThreadsBySourceMsgId(id), isEqual);

  return (
    <Flexbox
      direction={placement === 'end' ? 'horizontal-reverse' : 'horizontal'}
      gap={12}
      paddingInline={16}
      style={{ paddingBottom: 16, ...style }}
    >
      <div style={{ width: 40 }} />
      <Flexbox className={styles.container} gap={4} padding={4} style={{ width: 'fit-content' }}>
        <Flexbox gap={8} horizontal paddingInline={6}>
          <Typography.Text style={{ fontSize: 12 }} type={'secondary'}>
            {t('thread.title')}
            {threads.length}
          </Typography.Text>
        </Flexbox>
        <Flexbox>
          {threads.map((thread) => (
            <ThreadItem key={thread.id} {...thread} />
          ))}
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
});

export default Thread;
