import { Aws } from '@lobehub/icons';
import { Icon } from '@lobehub/ui';
import { Button, Input, Select } from 'antd';
import { useTheme } from 'antd-style';
import { Network } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ModelProvider } from '@/libs/agent-runtime';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';

import { FormAction } from '../style';

const BedrockForm = memo(() => {
  const { t } = useTranslation('error');
  const [showRegion, setShow] = useState(false);

  const [accessKeyId, secretAccessKey, region, setConfig] = useGlobalStore((s) => [
    modelProviderSelectors.bedrockConfig(s).accessKeyId,
    modelProviderSelectors.bedrockConfig(s).secretAccessKey,
    modelProviderSelectors.bedrockConfig(s).region,
    s.setModelProviderConfig,
  ]);

  const theme = useTheme();
  return (
    <FormAction
      avatar={<Aws.Color color={theme.colorText} size={56} />}
      description={t('unlock.apikey.Bedrock.description')}
      title={t('unlock.apikey.Bedrock.title')}
    >
      <Input.Password
        autoComplete={'new-password'}
        onChange={(e) => {
          setConfig(ModelProvider.Bedrock, { accessKeyId: e.target.value });
        }}
        placeholder={'Aws Access Key Id'}
        type={'block'}
        value={accessKeyId}
      />
      <Input.Password
        autoComplete={'new-password'}
        onChange={(e) => {
          setConfig(ModelProvider.Bedrock, { secretAccessKey: e.target.value });
        }}
        placeholder={'Aws Secret Access Key'}
        type={'block'}
        value={secretAccessKey}
      />
      {showRegion ? (
        <Select
          onChange={(region) => {
            setConfig('bedrock', { region });
          }}
          options={['us-east-1', 'us-west-2', 'ap-southeast-1'].map((i) => ({
            label: i,
            value: i,
          }))}
          placeholder={'https://api.openai.com/v1'}
          style={{ width: '100%' }}
          value={region}
        />
      ) : (
        <Button
          block
          icon={<Icon icon={Network} />}
          onClick={() => {
            setShow(true);
          }}
          type={'text'}
        >
          {t('unlock.apikey.Bedrock.customRegion')}
        </Button>
      )}
    </FormAction>
  );
});

export default BedrockForm;
