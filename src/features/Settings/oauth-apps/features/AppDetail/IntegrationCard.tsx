'use client';

import { CopyButton, Flexbox } from '@lobehub/ui';
import { Text } from '@lobehub/ui/base-ui';
import { createStaticStyles } from 'antd-style';
import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { OIDC_ISSUER_PATH } from '@/libs/oidc-provider/routes';
import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';

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
  // The server's configured issuer (APP_URL), which also covers desktop and
  // reverse-proxied deployments. The page origin is only a fallback for a
  // server too old to send it.
  const configuredIssuer = useServerConfigStore(serverConfigSelectors.oidcIssuer);
  const issuer = configuredIssuer || `${window.location.origin}${OIDC_ISSUER_PATH}`;

  const endpoints = useMemo(
    () => getIntegrationEndpoints(issuer, applicationType),
    [issuer, applicationType],
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
