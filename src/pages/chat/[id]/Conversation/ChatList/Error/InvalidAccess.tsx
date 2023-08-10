import { Icon } from '@lobehub/ui';
import { Button, Segmented } from 'antd';
import { KeySquare, SquareAsterisk } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';
import { useSettings } from '@/store/settings';

import OtpInput from '../OTPInput';
import APIKeyForm from './ApiKeyForm';
import { ErrorActionContainer, FormAction } from './style';

const InvalidAccess = memo<{ id: string }>(({ id }) => {
  const { t } = useTranslation('error');
  const [mode, setMode] = useState('password');
  const [password, setSettings] = useSettings((s) => [s.settings.password, s.setSettings]);
  const [resend, deleteMessage] = useSessionStore((s) => [s.resendMessage, s.deleteMessage]);

  return (
    <ErrorActionContainer>
      <Segmented
        block
        onChange={(value) => setMode(value as string)}
        options={[
          { icon: <Icon icon={SquareAsterisk} />, label: '密码', value: 'password' },
          { icon: <Icon icon={KeySquare} />, label: 'OpenAI API Key', value: 'api' },
        ]}
        style={{ width: '100%' }}
        value={mode}
      />
      <Flexbox gap={24}>
        {mode === 'password' ? (
          <>
            <FormAction
              avatar={'🗳'}
              description={t('unlock.password.description')}
              title={t('unlock.password.title')}
            >
              <OtpInput
                onChange={(e) => {
                  setSettings({ password: e });
                }}
                validationPattern={/[\dA-Za-z]/}
                value={password}
              />
            </FormAction>
            <Button
              onClick={() => {
                resend(id);
                deleteMessage(id);
              }}
              type={'primary'}
            >
              {t('unlock.confirm')}
            </Button>
          </>
        ) : (
          <APIKeyForm
            onConfirm={() => {
              resend(id);
              deleteMessage(id);
            }}
          />
        )}
      </Flexbox>
    </ErrorActionContainer>
  );
});

export default InvalidAccess;
