import { ProviderIcon } from '@lobehub/icons-rn';
import { Button, Center, Flexbox, Text } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { ModelProvider } from 'model-bank';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { createStyles } from '@/components/styles';
import { useProviderName } from '@/hooks/useProviderName';

const useStyles = createStyles(({ token }) => ({
  avatar: {
    alignItems: 'center',
    backgroundColor: token.colorFillContent,
    borderRadius: token.borderRadiusLG,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  container: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    padding: token.paddingLG,
  },
  description: {
    color: token.colorTextTertiary,
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
  },
  title: {
    color: token.colorText,
    textAlign: 'center',
  },
}));

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
    const { styles } = useStyles();
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
      <Center gap={16} style={styles.container}>
        {/* Provider Avatar */}
        <Center style={styles.avatar}>
          <ProviderIcon provider={provider} size={56} type="avatar" />
        </Center>

        {/* Title and Description */}
        <Flexbox gap={8} style={styles.formSection}>
          <Text fontSize={18} style={styles.title} weight={600}>
            {t('unlock.apiKey.title', { name: providerName })}
          </Text>
          <Text fontSize={14} style={styles.description}>
            {isSpecialProvider ? bedrockDescription : description}
          </Text>
        </Flexbox>

        {/* Action Buttons */}
        <Flexbox gap={12} style={styles.formSection}>
          <Button block onPress={handleGoToSettings} type="primary">
            {t('unlock.goToSettings', { ns: 'error' })}
          </Button>
          <Button block onPress={onClose}>
            {t('unlock.closeMessage')}
          </Button>
        </Flexbox>
      </Center>
    );
  },
);

APIKeyForm.displayName = 'APIKeyForm';

export default APIKeyForm;
