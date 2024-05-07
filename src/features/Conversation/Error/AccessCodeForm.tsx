import { Button, Input } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import { FormAction } from './style';

interface AccessCodeFormProps {
  id: string;
}

const AccessCodeForm = memo<AccessCodeFormProps>(({ id }) => {
  const { t } = useTranslation('error');
  const [password, setSettings] = useUserStore((s) => [
    settingsSelectors.currentSettings(s).password,
    s.setSettings,
  ]);
  const [resend, deleteMessage] = useChatStore((s) => [s.regenerateMessage, s.deleteMessage]);

  return (
    <>
      <FormAction
        avatar={'🗳'}
        description={t('unlock.password.description')}
        title={t('unlock.password.title')}
      >
        <Input.Password
          autoComplete={'new-password'}
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
  );
});

export default AccessCodeForm;
