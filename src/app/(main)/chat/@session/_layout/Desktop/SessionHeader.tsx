'use client';

import { ActionIcon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { MessageSquarePlus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { ProductLogo } from '@/components/Branding';
import { DESKTOP_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import SyncStatusTag from '@/features/SyncStatusInspector';
import { useActionSWR } from '@/libs/swr';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';

import SessionSearchBar from '../../features/SessionSearchBar';

export const useStyles = createStyles(({ css, token }) => ({
  logo: css`
    color: ${token.colorText};
    fill: ${token.colorText};
  `,
  top: css`
    position: sticky;
    inset-block-start: 0;
  `,
}));

const Header = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('chat');
  const [createSession] = useSessionStore((s) => [s.createSession]);
  const { enableWebrtc, showCreateSession } = useServerConfigStore(featureFlagsSelectors);

  const { mutate, isValidating } = useActionSWR('session.createSession', () => createSession());

  return (
    <Flexbox className={styles.top} gap={16} padding={16}>
      <Flexbox distribution={'space-between'} horizontal>
        <Flexbox align={'center'} gap={4} horizontal>
          <ProductLogo className={styles.logo} size={36} type={'text'} />
          {enableWebrtc && <SyncStatusTag />}
        </Flexbox>
        {showCreateSession && (
          <ActionIcon
            icon={MessageSquarePlus}
            loading={isValidating}
            onClick={() => mutate()}
            size={DESKTOP_HEADER_ICON_SIZE}
            style={{ flex: 'none' }}
            title={t('newAgent')}
          />
        )}
      </Flexbox>
      <SessionSearchBar />
    </Flexbox>
  );
});

export default Header;
