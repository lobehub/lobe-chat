'use client';

import { isDesktop } from '@lobechat/const';
import { CopyButton, Flexbox } from '@lobehub/ui';
import { Text } from '@lobehub/ui/base-ui';
import { createStaticStyles } from 'antd-style';
import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useElectronStore } from '@/store/electron';
import { electronSyncSelectors } from '@/store/electron/selectors';

import { getIntegrationEndpoints, type IntegrationEndpointKey } from '../../integrationEndpoints';
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

interface IntegrationCardProps {
  applicationType?: string | null;
}

/**
 * Where to point the client. Without this the page hands over a client ID and
 * leaves the developer to find the issuer and endpoints somewhere else.
 */
const IntegrationCard: FC<IntegrationCardProps> = ({ applicationType }) => {
  const { t } = useTranslation('auth');
  // The desktop renderer runs on its own origin; the provider lives on the
  // server it is connected to.
  const remoteServerUrl = useElectronStore(electronSyncSelectors.remoteServerUrl);
  const origin = (isDesktop && remoteServerUrl) || window.location.origin;

  const endpoints = useMemo(
    () => getIntegrationEndpoints(origin, applicationType),
    [origin, applicationType],
  );

  return (
    <SectionCard title={t('oauthApp.integration.title')}>
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

export default IntegrationCard;
