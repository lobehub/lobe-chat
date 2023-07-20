import { InputNumber, Slider } from 'antd';
import { SliderSingleProps } from 'antd/es/slider';
import { isNull } from 'lodash-es';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

const SliderWithInput = memo<SliderSingleProps>(
  ({ step, value, onChange, max, min, defaultValue, ...props }) => {
    const handleOnchange = useCallback((value: number | null) => {
      if (Number.isNaN(value) || isNull(value)) return;
      onChange?.(value);
    }, []);

    return (
      <Flexbox direction={'horizontal'} gap={8}>
        <Slider
          defaultValue={defaultValue}
          max={max}
          min={min}
          onChange={handleOnchange}
          step={step}
          style={{ flex: 1 }}
          value={typeof value === 'number' ? value : 0}
          {...props}
        />
        <InputNumber
          defaultValue={defaultValue}
          max={max}
          min={min}
          onChange={handleOnchange}
          step={Number.isNaN(step) || isNull(step) ? undefined : step}
          style={{ flex: 1, maxWidth: 64 }}
          value={typeof value === 'number' ? value : 0}
        />
      </Flexbox>
    );
  },
);

export default SliderWithInput;
