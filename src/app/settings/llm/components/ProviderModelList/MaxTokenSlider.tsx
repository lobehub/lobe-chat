import { InputNumber, Slider, SliderSingleProps } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import useMergeState from 'use-merge-value';

const exponent = (num: number) => Math.log2(num);
const getRealValue = (num: number) => Math.round(Math.pow(2, num));

const marks: SliderSingleProps['marks'] = {
  [exponent(1)]: '0',
  [exponent(2)]: '2k',
  [exponent(4)]: '4k',
  [exponent(8)]: '8k',
  [exponent(16)]: '16k',
  [exponent(32)]: '32k',
  [exponent(64)]: '64k',
  [exponent(128)]: '128k',
  [exponent(256)]: '256k',
  [exponent(1024)]: '1M',
};

interface MaxTokenSliderProps {
  defaultValue?: number;
  onChange?: (value: number) => void;
  value?: number;
}

const MaxTokenSlider = memo<MaxTokenSliderProps>(({ value, onChange, defaultValue }) => {
  const [token, setTokens] = useMergeState(0, {
    defaultValue,
    onChange,
    value: value,
  });

  const [powValue, setPowValue] = useMergeState(0, {
    defaultValue: exponent(typeof defaultValue === 'undefined' ? 0 : defaultValue / 1000),
    value: exponent(typeof value === 'undefined' ? 0 : value / 1024),
  });

  const updateWithPowValue = (value: number) => {
    setPowValue(value);

    setTokens(getRealValue(value) === 1 ? 0 : getRealValue(value) * 1024);
  };

  const updateWithRealValue = (value: number) => {
    setTokens(value);

    setPowValue(exponent(value / 1024));
  };

  return (
    <Flexbox align={'center'} gap={12} horizontal>
      <Flexbox flex={1}>
        <Slider
          marks={marks}
          max={exponent(1024)}
          min={0}
          onChange={updateWithPowValue}
          step={2}
          tooltip={{
            formatter: (x) => {
              if (typeof x === 'undefined') return;

              if (x === 0) return '无限制';

              const value = getRealValue(x);

              if (value < 1024) return value.toFixed(0) + 'K';

              return (value / 1024).toFixed(0) + 'M';
            },
          }}
          value={powValue}
        />
      </Flexbox>
      <div>
        <InputNumber
          min={0}
          onChange={(e) => {
            if (!e && e !== 0) return;

            updateWithRealValue(e);
          }}
          step={2048}
          value={token}
        />
      </div>
    </Flexbox>
  );
});
export default MaxTokenSlider;
