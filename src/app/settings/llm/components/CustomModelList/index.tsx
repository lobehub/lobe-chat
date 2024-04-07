import { Select } from 'antd';
import { css, cx } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { filterEnabledModels } from '@/config/modelProviders';
import { useGlobalStore } from '@/store/global';
import { modelConfigSelectors, modelProviderSelectors } from '@/store/global/selectors';
import { GlobalLLMProviderKey } from '@/types/settings';

import { OptionRender } from './Option';

const popup = css`
  &.ant-select-dropdown {
    .ant-select-item-option-selected {
      font-weight: normal;
    }
  }
`;

interface CustomModelSelectProps {
  onChange?: (value: string[]) => void;
  placeholder?: string;
  provider: string;
  value?: string[];
}

const CustomModelSelect = memo<CustomModelSelectProps>(({ provider, placeholder, onChange }) => {
  const providerCard = useGlobalStore(
    (s) => modelProviderSelectors.providerModelList(s).find((s) => s.id === provider),
    isEqual,
  );
  const providerConfig = useGlobalStore((s) =>
    modelConfigSelectors.providerConfig(provider as GlobalLLMProviderKey)(s),
  );

  const defaultEnableModel = providerCard ? filterEnabledModels(providerCard) : [];

  return (
    <Select<string[]>
      allowClear
      defaultValue={defaultEnableModel}
      mode="tags"
      onChange={(value) => {
        onChange?.(value.filter(Boolean));
      }}
      optionFilterProp="label"
      optionRender={({ label, value }) => (
        <OptionRender displayName={label as string} id={value as string} />
      )}
      options={providerCard?.chatModels.map((model) => ({
        label: model.displayName || model.id,
        value: model.id,
      }))}
      placeholder={placeholder}
      popupClassName={cx(popup)}
      popupMatchSelectWidth={false}
      value={providerConfig?.models.filter(Boolean)}
    />
  );
});

export default CustomModelSelect;
