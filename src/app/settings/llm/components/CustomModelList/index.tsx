import { Select } from 'antd';
import { css, cx } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';

import { OptionRender } from './Option';

const popup = css`
  &.ant-select-dropdown {
    .ant-select-item-option-selected {
      font-weight: normal;
    }
  }
`;

interface CustomModelSelectProps {
  placeholder?: string;
  provider: string;
}

const CustomModelSelect = memo<CustomModelSelectProps>(({ provider, placeholder }) => {
  const providerCard = useGlobalStore(
    (s) => modelProviderSelectors.modelSelectList(s).find((s) => s.id === provider),
    isEqual,
  );
  const defaultEnableModel = providerCard?.chatModels.filter((v) => !v.hidden).map((m) => m.id);

  return (
    <Select
      allowClear
      defaultValue={defaultEnableModel}
      mode="tags"
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
    />
  );
});

export default CustomModelSelect;
