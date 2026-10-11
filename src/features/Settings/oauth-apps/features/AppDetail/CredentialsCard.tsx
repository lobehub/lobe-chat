'use client';

import { CopyButton, Flexbox } from '@lobehub/ui';
import { Button, Tag, Text } from '@lobehub/ui/base-ui';
import { createStaticStyles } from 'antd-style';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

import { type OAuthAppItem } from '@/types/oauthApp';

import ClientIdDisplay from '../ClientIdDisplay';
import SectionCard from './SectionCard';

const styles = createStaticStyles(({ css, cssVar }) => ({
  hint: css`
    font-size: 12px;
    line-height: 1.5;
    color: ${cssVar.colorTextSecondary};
  `,
  inlineCode: css`
    padding-inline: 4px;
    border-radius: 4px;
    font-family: ${cssVar.fontFamilyCode};
    background: ${cssVar.colorFillTertiary};
  `,
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
  secret: css`
    padding-block: 2px;
    padding-inline: 12px 2px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadius};

    font-family: ${cssVar.fontFamilyCode};
    font-size: 13px;
    overflow-wrap: anywhere;
  `,
}));

interface CredentialsCardProps {
  canEdit: boolean;
  detail: OAuthAppItem;
  /** Plaintext of a secret issued on this page, shown once until dismissed. */
  freshSecret?: string;
  onDismissFreshSecret: () => void;
  /** Issues the first secret; nothing to invalidate yet, so no confirmation. */
  onGenerateSecret: () => void;
  /** Replaces the current secret; the caller confirms first. */
  onRotateSecret: () => void;
  secretPending: boolean;
}

/** Renders the copy's backtick-quoted parameter names as inline code. */
const withInlineCode = (text: string, className: string) =>
  text.split('`').map((part, index) =>
    index % 2 === 1 ? (
      <code className={className} key={index}>
        {part}
      </code>
    ) : (
      part
    ),
  );

/**
 * What a developer copies into their client: the client ID, the type that
 * decides the flow, and — for web apps — the client secret.
 *
 * A web app gets no secret at creation. The owner generates it here when they
 * are ready to store it; the plaintext is then shown once, in place, and masked
 * after they dismiss it or leave the page.
 */
const CredentialsCard: FC<CredentialsCardProps> = ({
  canEdit,
  detail,
  freshSecret,
  onDismissFreshSecret,
  onGenerateSecret,
  onRotateSecret,
  secretPending,
}) => {
  const { t } = useTranslation('auth');
  const isWebApp = detail.applicationType === 'web';

  const renderSecretAction = () => {
    if (freshSecret) return null;

    if (!detail.hasSecret)
      return (
        <Flexbox horizontal align={'center'} gap={8}>
          <Text type={'secondary'}>{t('oauthApp.secret.notGenerated')}</Text>
          <Button
            disabled={!canEdit}
            loading={secretPending}
            size={'small'}
            onClick={onGenerateSecret}
          >
            {t('oauthApp.secret.generate')}
          </Button>
        </Flexbox>
      );

    return (
      <Flexbox horizontal align={'center'} gap={8}>
        <Text type={'secondary'}>{t('oauthApp.secret.hidden')}</Text>
        <Button disabled={!canEdit} loading={secretPending} size={'small'} onClick={onRotateSecret}>
          {t('oauthApp.secret.rotate')}
        </Button>
      </Flexbox>
    );
  };

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

        {isWebApp && (
          <Flexbox gap={8}>
            <div className={styles.row}>
              <span className={styles.label}>{t('oauthApp.detail.clientSecret')}</span>
              {renderSecretAction()}
            </div>

            {freshSecret && (
              <Flexbox gap={8}>
                <Flexbox horizontal align={'center'} className={styles.secret} gap={8}>
                  <Flexbox flex={1}>{freshSecret}</Flexbox>
                  <CopyButton
                    content={freshSecret}
                    size={'small'}
                    title={t('oauthApp.secret.copy')}
                  />
                </Flexbox>
                <Flexbox horizontal align={'center'} gap={12} justify={'space-between'}>
                  <span className={styles.hint}>
                    {t('oauthApp.secret.onceWarning')}{' '}
                    {withInlineCode(t('oauthApp.secret.usage'), styles.inlineCode)}
                  </span>
                  <Button size={'small'} style={{ flex: 'none' }} onClick={onDismissFreshSecret}>
                    {t('oauthApp.secret.dismiss')}
                  </Button>
                </Flexbox>
              </Flexbox>
            )}
          </Flexbox>
        )}
      </Flexbox>
    </SectionCard>
  );
};

export default CredentialsCard;
