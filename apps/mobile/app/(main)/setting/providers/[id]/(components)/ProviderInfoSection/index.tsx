import React, { memo } from 'react';
import { View, Text } from 'react-native';

import { useThemeToken } from '@/theme';
import { AiProviderDetailItem } from '@/types/aiProvider';
import { useAiInfraStore } from '@/store/aiInfra';
import { aiProviderSelectors } from '@/store/aiInfra/selectors';
import { InstantSwitch } from '@/components';
import { useTranslation } from 'react-i18next';

import { useStyles } from './style';
import { ProviderCombine } from '@lobehub/icons-rn';

interface ProviderInfoSectionProps {
  provider: AiProviderDetailItem;
}

const ProviderInfoSection = memo<ProviderInfoSectionProps>(({ provider }) => {
  const { styles } = useStyles();
  const token = useThemeToken();
  const { t } = useTranslation(['setting']);

  // Store hooks
  const { toggleProviderEnabled } = useAiInfraStore();
  const isEnabled = aiProviderSelectors.isProviderEnabled(provider.id)(useAiInfraStore.getState());

  const handleSwitchChange = async (value: boolean) => {
    try {
      await toggleProviderEnabled(provider.id, value);
      console.log(
        `Successfully toggled provider ${provider.id} to ${value ? 'enabled' : 'disabled'}`,
      );
    } catch (error) {
      console.error(`Failed to toggle provider ${provider.id}:`, error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <ProviderCombine
            color={token.colorText}
            iconProps={{
              color: token.colorText,
            }}
            provider={provider.id}
            size={24}
          />
          <Text style={styles.subtitle}>
            {provider.source === 'builtin'
              ? t('aiProviders.info.builtIn', { ns: 'setting' })
              : t('aiProviders.info.custom', { ns: 'setting' })}
          </Text>
        </View>

        {/* InstantSwitch control area */}
        <View style={styles.switchContainer}>
          <InstantSwitch enabled={isEnabled} onChange={handleSwitchChange} />
        </View>
      </View>

      {provider.description && <Text style={styles.description}>{provider.description}</Text>}
    </View>
  );
});

export default ProviderInfoSection;
