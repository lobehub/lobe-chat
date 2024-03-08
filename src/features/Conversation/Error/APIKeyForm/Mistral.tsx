import { Mistral } from '@lobehub/icons';
import { Input } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';

import { FormAction } from '../style';

const MistralForm = memo(() => {
  const { t } = useTranslation('error');
  // const [showProxy, setShow] = useState(false);

  const [apiKey, setConfig] = useGlobalStore((s) => [
    modelProviderSelectors.mistralAPIKey(s),
    s.setModelProviderConfig,
  ]);

  return (
    <FormAction
      avatar={<Mistral size={56} />}
      description={t('unlock.apikey.Mistral.description')}
      title={t('unlock.apikey.Mistral.title')}
    >
      <Input.Password
        autoComplete={'new-password'}
        onChange={(e) => {
          setConfig(ModelProvider.Mistral, { apiKey: e.target.value });
        }}
        placeholder={'*********************************'}
        type={'block'}
        value={apiKey}
      />
      {/*{showProxy ? (*/}
      {/*  <Input*/}
      {/*    onChange={(e) => {*/}
      {/*      setConfig({ endpoint: e.target.value });*/}
      {/*    }}*/}
      {/*    placeholder={'https://api.mistral.ai/v1'}*/}
      {/*    type={'block'}*/}
      {/*    value={proxyUrl}*/}
      {/*  />*/}
      {/*) : (*/}
      {/*  <Button*/}
      {/*    icon={<Icon icon={Network} />}*/}
      {/*    onClick={() => {*/}
      {/*      setShow(true);*/}
      {/*    }}*/}
      {/*    type={'text'}*/}
      {/*  >*/}
      {/*    {t('unlock.apikey.addProxyUrl')}*/}
      {/*  </Button>*/}
      {/*)}*/}
    </FormAction>
  );
});

export default MistralForm;
