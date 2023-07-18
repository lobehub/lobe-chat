import { InputNumber, Slider } from 'antd';
import { SliderSingleProps } from 'antd/es/slider';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const SliderWithInput = memo<SliderSingleProps>(
  ({ step, value, onChange, max, min, defaultValue, ...props }) => {
    return (
      <Flexbox direction={'horizontal'} gap={8}>
        <Slider
          defaultValue={defaultValue}
          max={max}
          min={min}
          onChange={onChange}
          step={step}
          style={{ flex: 1 }}
          value={value}
          {...props}
        />
        <InputNumber
          defaultValue={defaultValue}
          max={max}
          min={min}
          onChange={onChange as any}
          step={Number(step)}
          style={{ flex: 1, maxWidth: 64 }}
          value={value}
        />
      </Flexbox>
    );
  },
);

export default SliderWithInput;
