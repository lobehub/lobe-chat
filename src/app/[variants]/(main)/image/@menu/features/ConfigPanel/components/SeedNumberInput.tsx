import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGenerationConfigParam } from '@/store/image/slices/generationConfig/hooks';

import InputNumber from '../../../components/SeedNumberInput';

const SeedNumberInput = memo(() => {
  const { t } = useTranslation('image');
  const { value, setValue, min, max, step = 1 } = useGenerationConfigParam('seed');

  return (
    <InputNumber
      max={max}
      min={min}
      onChange={setValue as any}
      placeholder={t('config.seed.random')}
      step={step}
      value={value}
    />
  );
});

export default SeedNumberInput;
