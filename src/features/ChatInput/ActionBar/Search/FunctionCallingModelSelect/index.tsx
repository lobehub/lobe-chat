import { Select, type SelectProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo, useMemo } from 'react';

import { ModelItemRender, ProviderItemRender } from '@/components/ModelSelect';
import { useEnabledChatModels } from '@/hooks/useEnabledChatModels';
import { WorkingModel } from '@/types/agent';
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

interface ModelSelectProps extends SelectProps {
  onChange?: (props: WorkingModel) => void;
  showAbility?: boolean;
  value?: WorkingModel;
}

const ModelSelect = memo<ModelSelectProps>(({ value, onChange, ...rest }) => {
  const enabledList = useEnabledChatModels();

  const { styles } = useStyles();

  const options = useMemo<SelectProps['options']>(() => {
    const getChatModels = (provider: EnabledProviderWithModels) =>
      provider.children
        .filter((model) => !!model.abilities.functionCall)
        .map((model) => ({
          label: <ModelItemRender {...model} {...model.abilities} showInfoTag={false} />,
          provider: provider.id,
          value: `${provider.id}/${model.id}`,
        }));

    if (enabledList.length === 1) {
      const provider = enabledList[0];

      return getChatModels(provider);
    }

    return enabledList
      .filter((p) => !!getChatModels(p).length)
      .map((provider) => {
        const options = getChatModels(provider);

        return {
          label: (
            <ProviderItemRender
              logo={provider.logo}
              name={provider.name}
              provider={provider.id}
              source={provider.source}
            />
          ),
          options,
        };
      });
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
      variant={'filled'}
      {...rest}
    />
  );
});

export default ModelSelect;
