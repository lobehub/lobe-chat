import { Select } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGenerationConfigParam } from '@/store/image/slices/generationConfig/hooks';

const SizeSelect = memo(() => {
  const { t } = useTranslation('image');
  const { value, setValue, enumValues } = useGenerationConfigParam('size');
  const options = enumValues!.map((size) => ({
    label: size,
    value: size,
  }));

  return (
    <Select
      onChange={setValue}
      options={options}
      placeholder={t('config.size.placeholder', '选择尺寸')}
      value={value}
    />
  );
});

export default SizeSelect;
