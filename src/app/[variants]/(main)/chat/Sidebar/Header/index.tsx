'use client';

import { Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useInitAgentConfig } from '@/hooks/useInitAgentConfig';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors, sessionSelectors } from '@/store/session/selectors';

import Avatar from './Avatar';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow: hidden;
    border-block-end: 1px solid ${token.colorBorderSecondary};
  `,
}));

const HeaderInfo = memo(() => {
  const { t } = useTranslation(['chat', 'hotkey']);
  const { styles } = useStyles();
  useInitAgentConfig();

  const [isInbox, title] = useSessionStore((s) => [
    sessionSelectors.isInboxSession(s),
    sessionMetaSelectors.currentAgentTitle(s),
  ]);

  const displayTitle = isInbox ? t('inbox.title') : title;

  return (
    <Flexbox
      align={'center'}
      className={styles.container}
      flex={'none'}
      gap={8}
      height={48}
      horizontal
      justify={'space-between'}
      padding={8}
    >
      <Flexbox
        align={'center'}
        flex={1}
        gap={8}
        horizontal
        style={{
          overflow: 'hidden',
        }}
      >
        <Avatar size={32} />
        <Text ellipsis weight={500}>
          {displayTitle}
        </Text>
      </Flexbox>
    </Flexbox>
  );
});

export default HeaderInfo;
