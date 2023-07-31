import { Avatar } from '@lobehub/ui';
import { Button, Input } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { useSettings } from '@/store/settings';

import { useStyles } from './style';

const APIKeyForm = memo<{ onConfirm?: () => void }>(({ onConfirm }) => {
  const { t } = useTranslation('error');
  const { styles, theme } = useStyles();
  const [apiKey, setSettings] = useSettings(
    (s) => [s.settings.OPENAI_API_KEY, s.setSettings],
    shallow,
  );

  return (
    <Center gap={16} style={{ maxWidth: 300 }}>
      <Avatar avatar={'🔑'} background={theme.colorFillContent} gap={12} size={80} />
      <Flexbox style={{ fontSize: 20 }}>{t('unlock.apikey.title')}</Flexbox>
      <Flexbox className={styles.desc}>{t('unlock.apikey.description')}</Flexbox>
      <Input.Password
        onChange={(e) => {
          setSettings({ OPENAI_API_KEY: e.target.value });
        }}
        placeholder={'sk-*****************************************'}
        type={'block'}
        value={apiKey}
      />
      <Button block onClick={onConfirm} style={{ marginTop: 8 }} type={'primary'}>
        {t('unlock.confirm')}
      </Button>
    </Center>
  );
});

export default APIKeyForm;
