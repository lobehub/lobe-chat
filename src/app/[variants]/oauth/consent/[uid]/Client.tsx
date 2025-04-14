'use client';

import { Button, Card, Typography } from 'antd';
import { createStyles } from 'antd-style';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

type ClientProps = {
  clientId: string;
  error?: {
    message: string;
    title: string;
  };
  scopes: string[];
  uid: string;
};

const { Title, Text, Paragraph } = Typography;

const useStyles = createStyles(({ css, token }) => ({
  error: css`
    text-align: center;
  `,
  scope: css`
    margin-block: 8px;
    padding: 12px;
    border-radius: 4px;
    background: ${token.colorFillTertiary};
  `,
  scopes: css`
    width: 100%;
    margin-block: 16px;
  `,
}));

/**
 * 获取 Scope 的描述
 */
function getScopeDescription(scope: string, t: any): string {
  return t(`consent.scope.${scope}`, scope);
}

const ConsentClient = memo(({ uid, clientId, scopes, error }: ClientProps) => {
  const { styles } = useStyles();
  const { t } = useTranslation('oauth');

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <Center height="100vh">
        <div className={styles.error}>
          <Title level={2}>{error.title}</Title>
          <Paragraph>{error.message}</Paragraph>
        </div>
      </Center>
    );
  }

  return (
    <Center height="100vh">
      <Card style={{ maxWidth: 500, width: '100%' }}>
        <Flexbox gap={24}>
          <Title level={3} style={{ margin: 0 }}>
            {t('consent.title')}
          </Title>
          <Paragraph>{t('consent.description', { clientId })}</Paragraph>

          <div className={styles.scopes}>
            <Paragraph>{t('consent.permissionsTitle')}</Paragraph>
            {scopes.map((scope) => (
              <div className={styles.scope} key={scope}>
                <Text>{getScopeDescription(scope, t)}</Text>
              </div>
            ))}
          </div>

          <form action="/oidc/consent" method="post">
            <input name="uid" type="hidden" value={uid} />
            <Flexbox gap={12} horizontal justify="flex-end">
              <Button htmlType="submit" name="consent" value="deny">
                {t('consent.buttons.deny')}
              </Button>
              <Button htmlType="submit" name="consent" type="primary" value="accept">
                {t('consent.buttons.accept')}
              </Button>
            </Flexbox>
          </form>
        </Flexbox>
      </Card>
    </Center>
  );
});

ConsentClient.displayName = 'ConsentClient';

export { ConsentClient };
