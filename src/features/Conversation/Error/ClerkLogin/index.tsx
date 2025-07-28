import { Button } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import UserLoginOrSignup from '@/features/User/UserLoginOrSignup';
import { useGreeting } from '@/hooks/useGreeting';
import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import { ErrorActionContainer, FormAction } from '../style';

const ClerkLogin = memo<{ id: string }>(({ id }) => {
  const { t } = useTranslation('error');
  const [openSignIn, isSignedIn] = useUserStore((s) => [s.openLogin, s.isSignedIn]);
  const greeting = useGreeting();
  const nickName = useUserStore(userProfileSelectors.nickName);
  const [resend, deleteMessage] = useChatStore((s) => [s.regenerateMessage, s.deleteMessage]);

  return (
    <ErrorActionContainer>
      {isSignedIn ? (
        <FormAction
          avatar={'🌟'}
          description={t('clerkAuth.loginSuccess.desc', { greeting })}
          title={t('clerkAuth.loginSuccess.title', { nickName })}
        >
          <Button
            block
            onClick={() => {
              resend(id);
              deleteMessage(id);
            }}
            size={'large'}
            type={'primary'}
          >
            {t('clerkAuth.loginSuccess.action')}
          </Button>
        </FormAction>
      ) : (
        <UserLoginOrSignup onClick={openSignIn} />
      )}
    </ErrorActionContainer>
  );
});

export default ClerkLogin;
