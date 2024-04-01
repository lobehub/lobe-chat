import { ZeroOne } from '@lobehub/icons';
import { Input } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';

import { FormAction } from '../style';

const ZeroOneForm = memo(() => {
  const { t } = useTranslation('error');
  // const [showProxy, setShow] = useState(false);

  const [apiKey, setConfig] = useGlobalStore((s) => [
    modelProviderSelectors.zerooneAPIKey(s),
    s.setModelProviderConfig,
  ]);

  return (
    <FormAction
      avatar={<ZeroOne size={56} />}
      description={t('unlock.apikey.ZeroOne.description')}
      title={t('unlock.apikey.ZeroOne.title')}
    >
      <Input.Password
        autoComplete={'new-password'}
        onChange={(e) => {
          setConfig(ModelProvider.ZeroOne, { apiKey: e.target.value });
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

export default ZeroOneForm;
