'use client';

import { Avatar } from '@lobehub/ui';
import { Button, Card, Skeleton, Typography } from 'antd';
import { createStyles } from 'antd-style';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import OAuthApplicationLogo from './components/OAuthApplicationLogo';

interface LoginConfirmProps {
  clientMetadata: {
    clientName?: string;
    isFirstParty?: boolean;
    logo?: string;
  };
  uid: string;
}

const { Title } = Typography;

const useStyles = createStyles(({ css, token }) => ({
  authButton: css`
    width: 100%;
    height: 40px;
    border-radius: ${token.borderRadius}px;
    font-weight: 500;
  `,
  card: css`
    width: 100%;
    max-width: 500px;
    border-color: ${token.colorBorderSecondary};
    border-radius: 12px;

    background: ${token.colorBgContainer};
  `,
  container: css`
    width: 100%;
    min-height: 100vh;
    color: ${token.colorTextBase};
    background-color: ${token.colorBgLayout};
  `,
  title: css`
    margin-block-end: ${token.marginLG}px;
    color: ${token.colorTextBase};
    text-align: center;
  `,
}));

const LoginConfirmClient = memo<LoginConfirmProps>(({ uid, clientMetadata }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('oauth'); // Assuming translations are in 'oauth'

  const clientDisplayName = clientMetadata?.clientName || 'the application';

  const isUserStateInit = useUserStore((s) => s.isUserStateInit);
  const avatar = useUserStore(userProfileSelectors.userAvatar);
  const nickName = useUserStore(userProfileSelectors.nickName);

  const titleText = t('login.title', { clientName: clientDisplayName });
  const descriptionText = t('login.description', { clientName: clientDisplayName });
  const buttonText = t('login.button'); // Or "Continue"

  return (
    <Center className={styles.container} gap={16}>
      <Flexbox align={'center'} gap={40}>
        {/* Branding section - similar to Consent */}
        <OAuthApplicationLogo
          clientDisplayName={clientDisplayName}
          isFirstParty={clientMetadata.isFirstParty}
          logoUrl={clientMetadata.logo}
        />
      </Flexbox>
      <Title className={styles.title} level={3}>
        {titleText}
      </Title>

      <Card className={styles.card}>
        <Flexbox gap={64}>
          {/* Increased gap for better spacing */}
          <Flexbox gap={24}>
            <Center horizontal justify={'center'}>
              {isUserStateInit ? (
                <Flexbox align={'center'} gap={8} horizontal>
                  <Avatar alt={nickName || ''} avatar={avatar} size={40} />
                  <div style={{ fontSize: 20 }}>{nickName}</div>
                </Flexbox>
              ) : (
                <Flexbox gap={8} horizontal>
                  <Skeleton.Avatar active />
                  <Skeleton.Button active />
                </Flexbox>
              )}
            </Center>
            <div style={{ textAlign: 'center' }}>{descriptionText}</div>
          </Flexbox>

          <Flexbox gap={16}>
            {/* Form points to the endpoint handling login confirmation */}
            <form action="/oidc/consent" method="post" style={{ width: '100%' }}>
              {/* Adjust action URL */}
              <input name="uid" type="hidden" value={uid} />
              <input name="choice" type="hidden" value={'accept'} />
              {/* Single confirmation button */}
              <Button
                className={styles.authButton}
                disabled={!isUserStateInit}
                htmlType="submit"
                name="consent"
                size="large"
                type="primary"
                value="accept"
              >
                {buttonText}
              </Button>
            </form>
          </Flexbox>
        </Flexbox>
      </Card>
    </Center>
  );
});

LoginConfirmClient.displayName = 'LoginConfirmClient';

export default LoginConfirmClient;
