'use client';

import { Button, Center, Flexbox, FluentEmoji, Text } from '@lobehub/ui';
import { Divider } from 'antd';
import { useTheme } from 'antd-style';
import { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Loading from '@/components/Loading/BrandTextLoading';
import { MAX_WIDTH } from '@/const/layoutTokens';
import LangButton from '@/features/User/UserPanel/LangButton';
import ThemeButton from '@/features/User/UserPanel/ThemeButton';
import { useUserStore } from '@/store/user';
import { authSelectors, userProfileSelectors } from '@/store/user/selectors';

const WaitlistPage = memo(() => {
  const { t } = useTranslation('error');
  const theme = useTheme();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [isLogin, isLoaded, email, signOut] = useUserStore((s) => [
    authSelectors.isLogin(s),
    authSelectors.isLoaded(s),
    userProfileSelectors.email(s),
    s.logout,
  ]);

  // Redirect to home if not logged in
  useEffect(() => {
    if (isLoaded && !isLogin) {
      navigate('/', { replace: true });
    }
  }, [isLoaded, isLogin, navigate]);

  const handleSwitchAccount = useCallback(async () => {
    setIsLoggingOut(true);
    await signOut();
    setTimeout(() => {
      window.location.href = '/home';
    }, 1500);
  }, [signOut]);

  // Show loading while checking auth state
  if (!isLoaded || !isLogin) {
    return <Loading debugId="WaitlistPage > AuthCheck" />;
  }

  return (
    <Flexbox
      height={'100%'}
      padding={8}
      style={{
        position: 'relative',
      }}
      width={'100%'}
    >
      <Flexbox
        height={'100%'}
        style={{
          background: theme.colorBgContainer,
          border: `1px solid ${theme.isDarkMode ? theme.colorBorderSecondary : theme.colorBorder}`,
          borderRadius: theme.borderRadius,
          overflow: 'hidden',
          position: 'relative',
        }}
        width={'100%'}
      >
        <Flexbox
          align={'center'}
          gap={8}
          horizontal
          justify={'space-between'}
          padding={16}
          width={'100%'}
        >
          <div />
          <Flexbox align={'center'} horizontal>
            <LangButton placement={'bottomRight'} size={18} />
            <Divider
              style={{
                height: 24,
              }}
              type={'vertical'}
            />
            <ThemeButton placement={'bottomRight'} size={18} />
          </Flexbox>
        </Flexbox>
        <Center height={'100%'} padding={16} width={'100%'}>
          <Flexbox align={'center'} gap={24} style={{ maxWidth: MAX_WIDTH }}>
            <FluentEmoji emoji={'🎫'} size={64} />
            <h2 style={{ fontWeight: 'bold', margin: 0, textAlign: 'center' }}>
              {t('waitlist.title')}
            </h2>
            <div style={{ lineHeight: '1.8', textAlign: 'center' }}>
              <div>{t('waitlist.desc')}</div>
              {isLogin && email && (
                <div style={{ color: theme.colorTextSecondary, marginTop: '0.5em' }}>
                  {t('waitlist.currentEmail', { email })}
                </div>
              )}
            </div>
            {isLogin && (
              <Button loading={isLoggingOut} onClick={handleSwitchAccount} type={'primary'}>
                {t('waitlist.switchAccount')}
              </Button>
            )}
          </Flexbox>
        </Center>
        <Center padding={24}>
          <Text align={'center'} type={'secondary'}>
            © 2025 LobeHub, Inc. All rights reserved.
          </Text>
        </Center>
      </Flexbox>
    </Flexbox>
  );
});

WaitlistPage.displayName = 'WaitlistPage';

export default WaitlistPage;
