import { ModelProvider } from '@lobechat/model-runtime';
import { Aws } from '@lobehub/icons';
import { Button, Icon, InputPassword, Select } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Network, ShieldPlus } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FormAction } from '@/features/Conversation/Error/style';
import { useUserStore } from '@/store/user';
import { keyVaultsConfigSelectors } from '@/store/user/selectors';

const BedrockForm = memo<{ description: string }>(({ description }) => {
  const { t } = useTranslation('modelProvider');
  const [showRegion, setShow] = useState(false);
  const [showSessionToken, setShowSessionToken] = useState(false);

  const [accessKeyId, secretAccessKey, sessionToken, region, setConfig] = useUserStore((s) => [
    keyVaultsConfigSelectors.bedrockConfig(s).accessKeyId,
    keyVaultsConfigSelectors.bedrockConfig(s).secretAccessKey,
    keyVaultsConfigSelectors.bedrockConfig(s).sessionToken,
    keyVaultsConfigSelectors.bedrockConfig(s).region,
    s.updateKeyVaultConfig,
  ]);

  const theme = useTheme();
  return (
    <FormAction
      avatar={<Aws.Color color={theme.colorText} size={56} />}
      description={description}
      title={t('bedrock.unlock.title')}
    >
      <InputPassword
        autoComplete={'new-password'}
        onChange={(e) => {
          setConfig(ModelProvider.Bedrock, { accessKeyId: e.target.value });
        }}
        placeholder={'Aws Access Key Id'}
        value={accessKeyId}
        variant={'filled'}
      />
      <InputPassword
        autoComplete={'new-password'}
        onChange={(e) => {
          setConfig(ModelProvider.Bedrock, { secretAccessKey: e.target.value });
        }}
        placeholder={'Aws Secret Access Key'}
        value={secretAccessKey}
        variant={'filled'}
      />
      {showSessionToken ? (
        <InputPassword
          autoComplete={'new-password'}
          onChange={(e) => {
            setConfig(ModelProvider.Bedrock, { sessionToken: e.target.value });
          }}
          placeholder={'Aws Session Token'}
          value={sessionToken}
          variant={'filled'}
        />
      ) : (
        <Button
          block
          icon={ShieldPlus}
          onClick={() => {
            setShowSessionToken(true);
          }}
          type={'text'}
        >
          {t('bedrock.unlock.customSessionToken')}
        </Button>
      )}
      {showRegion ? (
        <Select
          onChange={(region) => {
            setConfig('bedrock', { region });
          }}
          options={['us-east-1', 'us-west-2', 'ap-southeast-1', 'eu-central-1'].map((i) => ({
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
          {t('bedrock.unlock.customRegion')}
        </Button>
      )}
    </FormAction>
  );
});

export default BedrockForm;
