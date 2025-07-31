import { Select, type SelectProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';

import { ModelItemRender, ProviderItemRender, TAG_CLASSNAME } from '@/components/ModelSelect';
import { EnabledProviderWithModels } from '@/types/aiProvider';
import { invariant } from '@/utils/invariant';

const useStyles = createStyles(({ css, prefixCls }) => ({
  popup: css`
    &.${prefixCls}-select-dropdown .${prefixCls}-select-item-option-grouped {
      padding-inline-start: 12px;
    }
  `,
  select: css`
    .${prefixCls}-select-selection-item {
      .${TAG_CLASSNAME} {
        display: none;
      }
    }
  `,
}));

export interface SettingModelSelectProps {
  onChange?: (props: { model: string; provider: string }) => void;
  providers?: EnabledProviderWithModels[];
  showAbility?: boolean;
  value?: { model: string; provider?: string };
}

export function SettingModelSelect(props: SettingModelSelectProps) {
  const { providers, value, onChange, showAbility } = props;

  const { styles } = useStyles();

  const renderProviderOptions = (provider: EnabledProviderWithModels) =>
    provider.children.map((model) => ({
      label: <ModelItemRender {...model} {...model.abilities} showInfoTag={showAbility} />,
      provider: provider.id,
      value: `${provider.id}/${model.id}`,
    }));

  const options: SelectProps['options'] = [];
  if (providers?.length === 1) {
    options.push(...renderProviderOptions(providers[0]));
  } else if (providers) {
    for (const provider of providers) {
      if (provider.children.length < 1) continue;
      const { logo, name, id, source } = provider;
      options.push({
        label: <ProviderItemRender logo={logo} name={name} provider={id} source={source} />,
        options: renderProviderOptions(provider),
      });
    }
  }

  let displayTitle = '';
  if (value && options.length > 0) {
    const { provider, model } = value;
    invariant(provider);
    displayTitle = `${provider}/${model}`;
  }

  const handleChange: SelectProps['onChange'] = (value, option) => {
    if (!onChange) return;
    invariant(option && !Array.isArray(option));
    const { provider } = option;
    invariant(provider);
    const model = value.split('/').slice(1).join('/');
    invariant(model);
    onChange({ model, provider });
  };

  return (
    <Select
      className={styles.select}
      classNames={{ popup: { root: styles.popup } }}
      defaultValue={displayTitle}
      onChange={handleChange}
      options={options}
      popupMatchSelectWidth={false}
      value={displayTitle}
    />
  );
}
