import { Select, SelectProps } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useMemo } from 'react';

import { ModelItemRender, ProviderItemRender } from '@/components/ModelSelect';
import { useEnabledChatModels } from '@/hooks/useEnabledChatModels';
import { EnabledProviderWithModels } from '@/types/aiProvider';

const useStyles = createStyles(({ css, prefixCls }) => ({
  select: css`
    &.${prefixCls}-select-dropdown .${prefixCls}-select-item-option-grouped {
      padding-inline-start: 12px;
    }
  `,
}));

interface ModelOption {
  label: any;
  provider: string;
  value: string;
}

interface ModelSelectProps {
  onChange?: (props: { model: string; provider: string }) => void;
  showAbility?: boolean;
  value?: { model: string; provider?: string };
}

const ModelSelect = memo<ModelSelectProps>(({ value, onChange, showAbility = true }) => {
  const enabledList = useEnabledChatModels();

  const { styles } = useStyles();

  const options = useMemo<SelectProps['options']>(() => {
    const getChatModels = (provider: EnabledProviderWithModels) =>
      provider.children.map((model) => ({
        label: <ModelItemRender {...model} {...model.abilities} showInfoTag={showAbility} />,
        provider: provider.id,
        value: `${provider.id}/${model.id}`,
      }));

    if (enabledList.length === 1) {
      const provider = enabledList[0];

      return getChatModels(provider);
    }

    return enabledList.map((provider) => ({
      label: (
        <ProviderItemRender
          logo={provider.logo}
          name={provider.name}
          provider={provider.id}
          source={provider.source}
        />
      ),
      options: getChatModels(provider),
    }));
  }, [enabledList]);

  return (
    <Select
      onChange={(value, option) => {
        const model = value.split('/').slice(1).join('/');
        onChange?.({ model, provider: (option as unknown as ModelOption).provider });
      }}
      options={options}
      popupClassName={styles.select}
      popupMatchSelectWidth={false}
      value={`${value?.provider}/${value?.model}`}
    />
  );
});

export default ModelSelect;
