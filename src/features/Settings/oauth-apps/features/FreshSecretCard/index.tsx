'use client';

import { CopyButton, Flexbox, Icon } from '@lobehub/ui';
import { Button, Text } from '@lobehub/ui/base-ui';
import { createStaticStyles } from 'antd-style';
import { KeyRoundIcon } from 'lucide-react';
import { type FC } from 'react';
import { useTranslation } from 'react-i18next';

const styles = createStaticStyles(({ css, cssVar }) => ({
  card: css`
    padding: 16px;
    border: 1px solid ${cssVar.colorWarningBorder};
    border-radius: ${cssVar.borderRadiusLG};
    background: ${cssVar.colorWarningBg};
  `,
  icon: css`
    flex: none;
    color: ${cssVar.colorWarning};
  `,
  inlineCode: css`
    padding-inline: 4px;
    border-radius: 4px;
    font-family: ${cssVar.fontFamilyCode};
    background: ${cssVar.colorFillTertiary};
  `,
  secret: css`
    padding-block: 4px;
    padding-inline: 12px 4px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadius};

    font-family: ${cssVar.fontFamilyCode};
    font-size: 13px;
    overflow-wrap: anywhere;

    background: ${cssVar.colorBgContainer};
  `,
}));

interface FreshSecretCardProps {
  clientSecret: string;
  onDismiss: () => void;
}

/**
 * Shows a freshly issued client secret inline on the app page, next to the
 * rest of the app's configuration, instead of in a modal that interrupts the
 * page the user just landed on. It stays until the user confirms it is saved
 * or leaves the page; the plaintext is never shown again after that.
 */
const FreshSecretCard: FC<FreshSecretCardProps> = ({ clientSecret, onDismiss }) => {
  const { t } = useTranslation('auth');

  return (
    <Flexbox className={styles.card} gap={12}>
      <Flexbox horizontal align={'flex-start'} gap={10}>
        <Icon className={styles.icon} icon={KeyRoundIcon} size={18} style={{ marginTop: 2 }} />
        <Flexbox gap={2}>
          <Text weight={500}>{t('oauthApp.secret.revealTitle')}</Text>
          <Text style={{ fontSize: 12 }} type={'secondary'}>
            {t('oauthApp.secret.onceWarning')}
          </Text>
        </Flexbox>
      </Flexbox>
      <Flexbox horizontal align={'center'} className={styles.secret} gap={8}>
        <Flexbox flex={1}>{clientSecret}</Flexbox>
        <CopyButton content={clientSecret} title={t('oauthApp.secret.copy')} />
      </Flexbox>
      <Flexbox horizontal align={'center'} gap={12} justify={'space-between'}>
        <Text style={{ fontSize: 12 }} type={'secondary'}>
          {/* The copy marks the parameter name with backticks; render it as code. */}
          {t('oauthApp.secret.usage')
            .split('`')
            .map((part, index) =>
              index % 2 === 1 ? (
                <code className={styles.inlineCode} key={index}>
                  {part}
                </code>
              ) : (
                part
              ),
            )}
        </Text>
        <Button size={'small'} style={{ flex: 'none' }} onClick={onDismiss}>
          {t('oauthApp.secret.dismiss')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
};

export default FreshSecretCard;
