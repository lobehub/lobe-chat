import { Flexbox, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { shinyTextStylish } from '@/styles/loading';

import StatusIndicator from './StatusIndicator';

const useStyles = createStyles(({ token }) => ({
  shinyText: shinyTextStylish(token),
}));

interface ThinkingTitleProps {
  duration?: number;
  showDetail?: boolean;
  thinking?: boolean;
}

const ThinkingTitle = memo<ThinkingTitleProps>(({ showDetail, thinking, duration }) => {
  const { t } = useTranslation('components');
  const { styles } = useStyles();

  return (
    <Flexbox align={'center'} gap={6} horizontal>
      <StatusIndicator showDetail={showDetail} thinking={thinking} />
      {thinking ? (
        <span className={styles.shinyText}>{t('Thinking.thinking')}</span>
      ) : (
        <Text type={'secondary'}>
          {!duration
            ? t('Thinking.thoughtWithDuration')
            : t('Thinking.thought', { duration: ((duration || 0) / 1000).toFixed(1) })}
        </Text>
      )}
    </Flexbox>
  );
});

export default ThinkingTitle;
