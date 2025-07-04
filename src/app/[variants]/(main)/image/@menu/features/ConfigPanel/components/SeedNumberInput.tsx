import { InputNumber } from '@lobehub/ui';
import { memo, useCallback, useMemo } from 'react';

import { useGenerationConfigParam } from '@/store/image/slices/generationConfig/hooks';

const SeedNumberInput = memo(() => {
  const { value, setValue, min, max, step } = useGenerationConfigParam('seed');

  const handleChange = useCallback(
    (v: number | string | null) => {
      setValue(v as number | null);
    },
    [setValue],
  );

  const style = useMemo(() => ({ width: '100%' }), []);

  return (
    <InputNumber
      max={max}
      min={min}
      onChange={handleChange}
      step={step}
      style={style}
      value={value}
    />
  );
});

export default SeedNumberInput;
