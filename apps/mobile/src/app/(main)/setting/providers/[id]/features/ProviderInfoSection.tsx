import { AiProviderDetailItem } from '@lobechat/types';
import { ProviderIcon } from '@lobehub/icons-rn';
import { Cell, Flexbox, InstantSwitch } from '@lobehub/ui-rn';
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
  const isLobehub = provider.id === 'lobehub' || (provider as any)?.data?.id === 'lobehub';

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
          isLobehub || provider.source === 'builtin'
            ? t('aiProviders.info.builtIn', { ns: 'setting' })
            : t('aiProviders.info.custom', { ns: 'setting' })
        }
        extra={
          !isLobehub && <InstantSwitch defaultChecked={isEnabled} onChange={handleSwitchChange} />
        }
        icon={
          <ProviderIcon provider={isLobehub ? 'lobehub' : provider.id} size={44} type={'avatar'} />
        }
        iconSize={44}
        showArrow={false}
        title={isLobehub ? 'LobeHub' : provider.name}
        titleProps={{
          fontSize: 18,
          weight: 500,
        }}
      />
    </Flexbox>
  );
});

export default ProviderInfoSection;
