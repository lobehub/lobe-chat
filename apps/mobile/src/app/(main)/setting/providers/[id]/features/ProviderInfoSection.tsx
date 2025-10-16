import { AiProviderDetailItem } from '@lobechat/types';
import { ProviderIcon } from '@lobehub/icons-rn';
import { Cell, Flexbox, InstantSwitch, Text, useTheme } from '@lobehub/ui-rn';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAiInfraStore } from '@/store/aiInfra';
import { aiProviderSelectors } from '@/store/aiInfra/selectors';

interface ProviderInfoSectionProps {
  provider: AiProviderDetailItem;
  setLoading: (loading: boolean) => void;
}

const ProviderInfoSection = memo<ProviderInfoSectionProps>(({ setLoading, provider }) => {
  const { t } = useTranslation(['setting']);
  const theme = useTheme();

  // Store hooks
  const { toggleProviderEnabled } = useAiInfraStore();
  const isEnabled = aiProviderSelectors.isProviderEnabled(provider.id)(useAiInfraStore.getState());

  const handleSwitchChange = async (value: boolean) => {
    setLoading(true);
    try {
      await toggleProviderEnabled(provider.id, value);
      console.log(
        `Successfully toggled provider ${provider.id} to ${value ? 'enabled' : 'disabled'}`,
      );
    } catch (error) {
      console.error(`Failed to toggle provider ${provider.id}:`, error);
    }
    setLoading(false);
  };

  return (
    <Flexbox paddingBlock={4}>
      <Cell
        description={
          provider.source === 'builtin'
            ? t('aiProviders.info.builtIn', { ns: 'setting' })
            : t('aiProviders.info.custom', { ns: 'setting' })
        }
        extra={<InstantSwitch defaultChecked={isEnabled} onChange={handleSwitchChange} />}
        icon={<ProviderIcon provider={provider.id} size={44} type={'avatar'} />}
        iconSize={44}
        showArrow={false}
        title={provider.name}
        titleProps={{
          fontSize: 18,
          weight: 500,
        }}
      />

      {provider.description && (
        <Flexbox paddingInline={16} style={{ marginBottom: 16 }}>
          <Text as={'p'} color={theme.colorTextSecondary}>
            {provider.description}
          </Text>
        </Flexbox>
      )}
    </Flexbox>
  );
});

export default ProviderInfoSection;
