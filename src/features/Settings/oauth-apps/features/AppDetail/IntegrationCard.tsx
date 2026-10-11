'use client';

import { CopyButton, Flexbox } from '@lobehub/ui';
import { Button, Text, toast } from '@lobehub/ui/base-ui';
import { createStaticStyles } from 'antd-style';
import { CopyIcon } from 'lucide-react';
import { type FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAppOrigin } from '@/hooks/useAppOrigin';
import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';

import {
  getIntegrationEndpoints,
  type IntegrationEndpointKey,
  resolveIssuer,
} from '../../integrationEndpoints';
import { integrationPromptKey, integrationPromptValues } from '../../integrationPrompt';
import SectionCard from './SectionCard';

const styles = createStaticStyles(({ css, cssVar }) => ({
  prompt: css`
    overflow: auto;

    max-height: 180px;
    padding-block: 10px;
    padding-inline: 12px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadius};

    font-size: 13px;
    line-height: 1.6;
    color: ${cssVar.colorTextSecondary};
    white-space: pre-wrap;
  `,
  subTitle: css`
    font-size: 13px;
    font-weight: 500;
  `,
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
  clientId: string;
  name: string;
}

/**
 * How to wire the app into a project. The primary path is one prompt the
 * developer pastes into a coding agent, filled with this app's real client ID
 * and endpoints; the raw URLs stay below for configuring a client by hand.
 */
const IntegrationCard: FC<IntegrationCardProps> = ({ applicationType, clientId, name }) => {
  const { t } = useTranslation('auth');
  // The server's configured issuer (APP_URL), which also covers desktop and
  // reverse-proxied deployments; the app origin (the connected server on
  // desktop) is only a fallback for a server too old to send it.
  const configuredIssuer = useServerConfigStore(serverConfigSelectors.oidcIssuer);
  const appOrigin = useAppOrigin();
  const issuer = resolveIssuer(configuredIssuer, appOrigin);

  const endpoints = useMemo(
    () => getIntegrationEndpoints(issuer, applicationType),
    [issuer, applicationType],
  );

  const prompt = t(
    integrationPromptKey(applicationType),
    integrationPromptValues(endpoints, { clientId, name }),
  );

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success(t('oauthApp.integration.promptCopied'));
    } catch {
      toast.error(t('oauthApp.copy.error'));
    }
  };

  return (
    <SectionCard title={t('oauthApp.integration.title')}>
      <Flexbox gap={12}>
        <Flexbox horizontal align={'center'} gap={12} justify={'space-between'}>
          <Flexbox gap={2}>
            <span className={styles.subTitle}>{t('oauthApp.integration.oneClick')}</span>
            <Text style={{ fontSize: 12 }} type={'secondary'}>
              {t('oauthApp.integration.oneClickDesc')}
            </Text>
          </Flexbox>
          <Button
            icon={<CopyIcon size={14} />}
            style={{ flex: 'none' }}
            type={'primary'}
            onClick={copyPrompt}
          >
            {t('oauthApp.integration.copyPrompt')}
          </Button>
        </Flexbox>
        <div className={styles.prompt}>{prompt}</div>

        <Flexbox gap={2} style={{ marginTop: 8 }}>
          <span className={styles.subTitle}>{t('oauthApp.integration.manual')}</span>
          <Text style={{ fontSize: 12 }} type={'secondary'}>
            {t('oauthApp.integration.desc')}
          </Text>
        </Flexbox>
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
