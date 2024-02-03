import { Select } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { ModelItemRender, ProviderItemRender } from 'src/components/ModelSelect';

import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';

import { useStore } from '../store';

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

const ModelSelect = memo(() => {
  const [model, updateConfig] = useStore((s) => [s.config.model, s.setAgentConfig]);
  const select = useGlobalStore(modelProviderSelectors.modelSelectList, isEqual);
  const { styles } = useStyles();

  return (
    <Select
      className={styles.select}
      onChange={(model, option) => {
        updateConfig({ model, provider: (option as unknown as ModelOption).provider });
      }}
      options={select
        .filter((s) => s.enabled)
        .map((provider) => ({
          label: <ProviderItemRender provider={provider.id} />,
          options: provider.chatModels
            .filter((c) => !c.hidden)
            .map((model) => ({
              label: <ModelItemRender showInfoTag={false} {...model} />,
              provider: provider.id,
              value: model.id,
            })),
        }))}
      value={model}
    />
  );
});

export default ModelSelect;
