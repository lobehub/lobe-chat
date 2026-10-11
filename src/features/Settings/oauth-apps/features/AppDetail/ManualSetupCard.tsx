'use client';

import { CopyButton, Flexbox } from '@lobehub/ui';
import { Text } from '@lobehub/ui/base-ui';
import { createStaticStyles } from 'antd-style';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

import { type IntegrationEndpointKey } from '../../integrationEndpoints';
import { useIntegrationEndpoints } from './IntegrationCard';
import SectionCard from './SectionCard';

const styles = createStaticStyles(({ css, cssVar }) => ({
  label: css`
    font-size: 12px;
    color: ${cssVar.colorTextSecondary};
  `,
  value: css`
    padding-block: 2px;
    padding-inline: 12px 2px;
    border-radius: ${cssVar.borderRadius};

    font-family: ${cssVar.fontFamilyCode};
    font-size: 13px;
    overflow-wrap: anywhere;

    background: ${cssVar.colorFillQuaternary};
  `,
}));

const LABEL_KEYS = {
  authorization: 'oauthApp.integration.authorization',
  deviceAuthorization: 'oauthApp.integration.deviceAuthorization',
  discovery: 'oauthApp.integration.discovery',
  issuer: 'oauthApp.integration.issuer',
  token: 'oauthApp.integration.token',
} as const satisfies Record<IntegrationEndpointKey, string>;

interface ManualSetupCardProps {
  applicationType?: string | null;
}

/**
 * The raw issuer and endpoint URLs, for configuring an OAuth / OIDC client by
 * hand. Sits beside the client ID and secret on the Credentials tab.
 */
const ManualSetupCard: FC<ManualSetupCardProps> = ({ applicationType }) => {
  const { t } = useTranslation('auth');
  const endpoints = useIntegrationEndpoints(applicationType);

  return (
    <SectionCard title={t('oauthApp.integration.manual')}>
      <Flexbox gap={12}>
        <Text style={{ fontSize: 12 }} type={'secondary'}>
          {t('oauthApp.integration.desc')}
        </Text>
        {endpoints.map(({ key, url }) => (
          <Flexbox gap={6} key={key}>
            <span className={styles.label}>{t(LABEL_KEYS[key])}</span>
            <Flexbox horizontal align={'center'} className={styles.value} gap={8}>
              <Flexbox flex={1}>{url}</Flexbox>
              <CopyButton content={url} size={'small'} title={t('oauthApp.copy.tooltip')} />
            </Flexbox>
          </Flexbox>
        ))}
      </Flexbox>
    </SectionCard>
  );
};

export default ManualSetupCard;
