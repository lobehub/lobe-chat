'use client';

import { Flexbox } from '@lobehub/ui';
import { Button, Tag, Text } from '@lobehub/ui/base-ui';
import { createStaticStyles } from 'antd-style';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

import { type OAuthAppItem } from '@/types/oauthApp';

import ClientIdDisplay from '../ClientIdDisplay';
import SectionCard from './SectionCard';

const styles = createStaticStyles(({ css, cssVar }) => ({
  label: css`
    flex: none;
    font-size: 12px;
    color: ${cssVar.colorTextSecondary};
  `,
  row: css`
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;

    min-width: 0;
  `,
}));

interface CredentialsCardProps {
  canEdit: boolean;
  detail: OAuthAppItem;
  onRotateSecret: () => void;
  rotating: boolean;
}

/**
 * What a developer copies into their client: the client ID, the type that
 * decides the flow, and — for web apps — the secret, masked after it is issued.
 */
const CredentialsCard: FC<CredentialsCardProps> = ({
  canEdit,
  detail,
  onRotateSecret,
  rotating,
}) => {
  const { t } = useTranslation('auth');
  const isWebApp = detail.applicationType === 'web';

  return (
    <SectionCard title={t('oauthApp.detail.credentials')}>
      <Flexbox gap={16}>
        <div className={styles.row}>
          <span className={styles.label}>{t('oauthApp.detail.clientId')}</span>
          <ClientIdDisplay clientId={detail.id} />
        </div>

        <div className={styles.row}>
          <span className={styles.label}>{t('oauthApp.detail.type')}</span>
          <Tag>{t(isWebApp ? 'oauthApp.type.webBadge' : 'oauthApp.type.badge')}</Tag>
        </div>

        {detail.hasSecret && (
          <div className={styles.row}>
            <span className={styles.label}>{t('oauthApp.detail.clientSecret')}</span>
            <Flexbox horizontal align={'center'} gap={8}>
              <Text type={'secondary'}>{t('oauthApp.secret.hidden')}</Text>
              <Button
                disabled={!canEdit}
                loading={rotating}
                size={'small'}
                onClick={onRotateSecret}
              >
                {t('oauthApp.secret.rotate')}
              </Button>
            </Flexbox>
          </div>
        )}
      </Flexbox>
    </SectionCard>
  );
};

export default CredentialsCard;
