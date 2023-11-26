import { Icon, RenderErrorMessage } from '@lobehub/ui';
import { Button, Input, Segmented } from 'antd';
import { KeySquare, SquareAsterisk } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';

import APIKeyForm from './ApiKeyForm';
import { ErrorActionContainer, FormAction } from './style';

enum Tab {
  Api = 'api',
  Password = 'password',
}

const InvalidAccess: RenderErrorMessage['Render'] = memo(({ id }) => {
  const { t } = useTranslation('error');
  const [mode, setMode] = useState<Tab>(Tab.Password);
  const [password, setSettings] = useGlobalStore((s) => [s.settings.password, s.setSettings]);
  const [resend, deleteMessage] = useChatStore((s) => [s.resendMessage, s.deleteMessage]);

  return (
    <ErrorActionContainer>
      <Segmented
        block
        onChange={(value) => setMode(value as Tab)}
        options={[
          {
            icon: <Icon icon={SquareAsterisk} />,
            label: t('password', { ns: 'common' }),
            value: Tab.Password,
          },
          { icon: <Icon icon={KeySquare} />, label: 'OpenAI API Key', value: Tab.Api },
        ]}
        style={{ width: '100%' }}
        value={mode}
      />
      <Flexbox gap={24}>
        {mode === Tab.Password && (
          <>
            <FormAction
              avatar={'🗳'}
              description={t('unlock.password.description')}
              title={t('unlock.password.title')}
            >
              <Input.Password
                onChange={(e) => {
                  setSettings({ password: e.target.value });
                }}
                placeholder={t('unlock.password.placeholder')}
                type={'block'}
                value={password}
              />
            </FormAction>
            <Flexbox gap={12}>
              <Button
                onClick={() => {
                  resend(id);
                  deleteMessage(id);
                }}
                type={'primary'}
              >
                {t('unlock.confirm')}
              </Button>
              <Button
                onClick={() => {
                  deleteMessage(id);
                }}
              >
                {t('unlock.closeMessage')}
              </Button>
            </Flexbox>
          </>
        )}
        {mode === Tab.Api && <APIKeyForm id={id} />}
      </Flexbox>
    </ErrorActionContainer>
  );
});

export default InvalidAccess;
