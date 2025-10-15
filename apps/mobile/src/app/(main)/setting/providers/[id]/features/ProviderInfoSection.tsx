import { AiProviderDetailItem } from '@lobechat/types';
import { ProviderIcon } from '@lobehub/icons-rn';
import { Cell, Divider, Flexbox, InstantSwitch, Text } from '@lobehub/ui-rn';
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
        icon={<ProviderIcon provider={provider.id} size={32} type={'avatar'} />}
        iconSize={32}
        showArrow={false}
        title={provider.name}
      />
      <Flexbox paddingInline={16}>
        {provider.description && (
          <Text as={'p'} type={'secondary'}>
            {provider.description}
          </Text>
        )}
      </Flexbox>
      <Divider style={{ marginBlock: 16 }} />
    </Flexbox>
  );
});

export default ProviderInfoSection;
