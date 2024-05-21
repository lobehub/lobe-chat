import { Select, SelectProps } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo, useMemo } from 'react';

import { ModelItemRender, ProviderItemRender } from '@/components/ModelSelect';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';
import { ModelProviderCard } from '@/types/llm';

const useStyles = createStyles(({ css, prefixCls }) => ({
  select: css`
    .${prefixCls}-select-dropdown .${prefixCls}-select-item-option-grouped {
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
  value?: string;
}

const ModelSelect = memo<ModelSelectProps>(({ value, onChange }) => {
  const enabledList = useUserStore(modelProviderSelectors.modelProviderListForModelSelect, isEqual);

  const { styles } = useStyles();

  const options = useMemo<SelectProps['options']>(() => {
    const getChatModels = (provider: ModelProviderCard) =>
      provider.chatModels.map((model) => ({
        label: <ModelItemRender {...model} />,
        provider: provider.id,
        value: model.id,
      }));

    if (enabledList.length === 1) {
      const provider = enabledList[0];

      return getChatModels(provider);
    }

    return enabledList.map((provider) => ({
      label: <ProviderItemRender provider={provider.id} />,
      options: getChatModels(provider),
    }));
  }, [enabledList]);

  return (
    <Select
      className={styles.select}
      onChange={(model, option) => {
        onChange?.({ model, provider: (option as unknown as ModelOption).provider });
      }}
      options={options}
      popupMatchSelectWidth={false}
      value={value}
    />
  );
});

export default ModelSelect;
