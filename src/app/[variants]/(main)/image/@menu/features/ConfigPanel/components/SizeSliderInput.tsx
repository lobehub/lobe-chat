import { SliderWithInput } from '@lobehub/ui';
import { memo } from 'react';

import { useGenerationConfigParam } from '@/store/image/slices/generationConfig/hooks';

interface SizeSliderInputProps {
  paramName: 'width' | 'height';
}

const SizeSliderInput = memo(({ paramName }: SizeSliderInputProps) => {
  const { value, setValue, min, max } = useGenerationConfigParam(paramName);
  return <SliderWithInput max={max} min={min} onChange={setValue} value={value} />;
});

export default SizeSliderInput;
