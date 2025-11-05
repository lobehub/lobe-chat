import { ProviderIcon } from '@lobehub/icons-rn';
import { Cell } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { ModelProvider } from 'model-bank';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useProviderName } from '@/hooks/useProviderName';

interface APIKeyFormProps {
  bedrockDescription: string;
  description: string;
  id: string;
  onClose: () => void;
  onRecreate: () => void;
  provider?: string;
}

const APIKeyForm = memo<APIKeyFormProps>(
  ({ provider, description, bedrockDescription, onClose }) => {
    const { t } = useTranslation('error');
    const providerName = useProviderName(provider || '');
    const router = useRouter();

    // 跳转到设置页面配置 provider
    const handleGoToSettings = () => {
      if (provider) {
        router.push(`/setting/providers/${provider}`);
      }
      onClose();
    };

    // 特殊 provider 需要显示不同的描述
    const isSpecialProvider =
      provider === ModelProvider.Bedrock || provider === ModelProvider.ComfyUI;

    return (
      <Cell
        borderRadius={true}
        description={isSpecialProvider ? bedrockDescription : description}
        descriptionProps={{
          fontSize: 12,
        }}
        icon={<ProviderIcon provider={provider} size={44} type="avatar" />}
        iconSize={44}
        onPress={handleGoToSettings}
        pressEffect
        title={t('unlock.apiKey.title', { name: providerName })}
        titleProps={{
          ellipsis: {
            rows: 2,
          },
          fontSize: 14,
        }}
        variant={'outlined'}
      />
    );
  },
);

APIKeyForm.displayName = 'APIKeyForm';

export default APIKeyForm;
