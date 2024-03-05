import { Icon } from '@lobehub/ui';
import { App, Button } from 'antd';
import { ScanFace } from 'lucide-react';
import { signIn, signOut } from 'next-auth/react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useOAuthSession } from '@/hooks/useOAuthSession';
import { useChatStore } from '@/store/chat';

import { FormAction } from './style';

const OAuthForm = memo<{ id: string }>(({ id }) => {
  const { t } = useTranslation('error');

  const { user, isOAuthLoggedIn } = useOAuthSession();

  const [resend, deleteMessage] = useChatStore((s) => [s.internalResendMessage, s.deleteMessage]);

  const { message, modal } = App.useApp();

  const handleSignOut = useCallback(() => {
    modal.confirm({
      centered: true,
      okButtonProps: { danger: true },
      onOk: () => {
        signOut();
        message.success(t('settingSystem.oauth.signout.success', { ns: 'setting' }));
      },
      title: t('settingSystem.oauth.signout.confirm', { ns: 'setting' }),
    });
  }, []);

  return (
    <Center gap={16} style={{ maxWidth: 300 }}>
      <FormAction
        avatar={isOAuthLoggedIn ? '✅' : '🕵️‍♂️'}
        description={
          isOAuthLoggedIn
            ? `${t('unlock.oauth.welcome')} ${user?.name}`
            : t('unlock.oauth.description')
        }
        title={isOAuthLoggedIn ? t('unlock.oauth.success') : t('unlock.oauth.title')}
      >
        {isOAuthLoggedIn ? (
          <Button
            block
            icon={<Icon icon={ScanFace} />}
            onClick={handleSignOut}
            style={{ marginTop: 8 }}
          >
            {t('settingSystem.oauth.signout.action', { ns: 'setting' })}
          </Button>
        ) : (
          <Button
            block
            icon={<Icon icon={ScanFace} />}
            loading={status === 'loading'}
            onClick={() => signIn()}
            style={{ marginTop: 8 }}
            type={'primary'}
          >
            {t('oauth', { ns: 'common' })}
          </Button>
        )}
      </FormAction>
      <Flexbox gap={12} width={'100%'}>
        {isOAuthLoggedIn ? (
          <Button
            block
            onClick={() => {
              resend(id);
              deleteMessage(id);
            }}
            style={{ marginTop: 8 }}
            type={'primary'}
          >
            {t('unlock.confirm')}
          </Button>
        ) : (
          <Button
            onClick={() => {
              deleteMessage(id);
            }}
          >
            {t('unlock.closeMessage')}
          </Button>
        )}
      </Flexbox>
    </Center>
  );
});

export default OAuthForm;
