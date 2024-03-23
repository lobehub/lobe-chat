import { OpenAI } from '@lobehub/icons';
import { Icon } from '@lobehub/ui';
import { Button, Input } from 'antd';
import { useTheme } from 'antd-style';
import { Network } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';

import { FormAction } from '../style';

const OpenAIForm = memo(() => {
  const { t } = useTranslation('error');
  const [showProxy, setShow] = useState(false);

  const [apiKey, proxyUrl, setConfig] = useGlobalStore((s) => [
    modelProviderSelectors.openAIAPIKey(s),
    modelProviderSelectors.openAIProxyUrl(s),
    s.setModelProviderConfig,
  ]);
  const theme = useTheme();
  return (
    <FormAction
      avatar={<OpenAI color={theme.colorText} size={64} />}
      description={t('unlock.apikey.OpenAI.description')}
      title={t('unlock.apikey.OpenAI.title')}
    >
      <Input.Password
        autoComplete={'new-password'}
        onChange={(e) => {
          setConfig('openAI', { OPENAI_API_KEY: e.target.value });
        }}
        placeholder={'sk-*****************************************'}
        type={'block'}
        value={apiKey}
      />
      {showProxy ? (
        <Input
          onChange={(e) => {
            setConfig('openAI', { endpoint: e.target.value });
          }}
          placeholder={'https://api.openai.com/v1'}
          type={'block'}
          value={proxyUrl}
        />
      ) : (
        <Button
          icon={<Icon icon={Network} />}
          onClick={() => {
            setShow(true);
          }}
          type={'text'}
        >
          {t('unlock.apikey.OpenAI.addProxyUrl')}
        </Button>
      )}
    </FormAction>
  );
});

export default OpenAIForm;
