import { Button, Input } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { settingsSelectors, useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';

import { FormAction } from './style';

const APIKeyForm = memo<{ id: string }>(({ id }) => {
  const { t } = useTranslation('error');

  const [apiKey, setKeys] = useGlobalStore((s) => [
    settingsSelectors.openAIAPI(s),
    s.setOpenAIAPIKey,
  ]);
  const [resend, deleteMessage] = useSessionStore((s) => [s.resendMessage, s.deleteMessage]);

  return (
    <Center gap={16} style={{ maxWidth: 300 }}>
      <FormAction
        avatar={'🔑'}
        description={t('unlock.apikey.description')}
        title={t('unlock.apikey.title')}
      >
        <Input.Password
          onChange={(e) => {
            setKeys(e.target.value);
          }}
          placeholder={'sk-*****************************************'}
          type={'block'}
          value={apiKey}
        />
      </FormAction>
      <Flexbox gap={12} width={'100%'}>
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
        <Button
          onClick={() => {
            deleteMessage(id);
          }}
        >
          {t('unlock.closeMessage')}
        </Button>
      </Flexbox>
    </Center>
  );
});

export default APIKeyForm;
