import { Zhipu } from '@lobehub/icons';
import { Input } from 'antd';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';

import { FormAction } from '../style';

const ZhipuForm = memo(() => {
  const { t } = useTranslation('error');

  const [apiKey, setConfig] = useGlobalStore((s) => [
    modelProviderSelectors.zhipuAPIKey(s),
    s.setModelProviderConfig,
    // modelProviderSelectors.zhipuAPIKey(s),
  ]);

  return (
    <FormAction
      avatar={<Zhipu.Color size={64} />}
      background={rgba(Zhipu.colorPrimary, 0.1)}
      description={t('unlock.apikey.Zhipu.description')}
      title={t('unlock.apikey.Zhipu.title')}
    >
      <Input.Password
        autoComplete={'new-password'}
        onChange={(e) => {
          setConfig(ModelProvider.ZhiPu, { apiKey: e.target.value });
        }}
        placeholder={'*************************.****************'}
        type={'block'}
        value={apiKey}
      />
      {/*{showProxy ? (*/}
      {/*  <Input*/}
      {/*    onChange={(e) => {*/}
      {/*      setConfig({ endpoint: e.target.value });*/}
      {/*    }}*/}
      {/*    placeholder={'https://api.openai.com/v1'}*/}
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

export default ZhipuForm;
