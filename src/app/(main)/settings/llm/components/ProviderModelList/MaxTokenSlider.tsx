import { InputNumber, Slider, SliderSingleProps } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import useMergeState from 'use-merge-value';

const exponent = (num: number) => Math.log2(num);
const getRealValue = (num: number) => Math.round(Math.pow(2, num));
const power1024 = (num: number) => Math.round(Math.pow(2, num) * 1024);

const isSmallScreen = typeof window !== 'undefined' ? window.innerWidth < 475 : false;

const marks: SliderSingleProps['marks'] = {
  [exponent(1)]: '0',
  [exponent(2)]: isSmallScreen ? '2' : '2K', // 2 Kibi = 2048
  [exponent(4)]: isSmallScreen ? '4' : '4K',
  [exponent(8)]: isSmallScreen ? '8' : '8K',
  [exponent(16)]: isSmallScreen ? '16' : '16K',
  [exponent(32)]: isSmallScreen ? '32' : '32K',
  [exponent(64)]: isSmallScreen ? '64' : '64K',
  // [exponent(128)]: isSmallScreen ? '128' : '128K',
  // [exponent(256)]: isSmallScreen ? '256' : '256K',
  [exponent((128 / 1024) * 1000)]: ' ', // hide tick mark
  [exponent((200 / 1024) * 1000)]: isSmallScreen ? '200' : '200k', // 200,000
  [exponent(1024)]: isSmallScreen ? '1024' : '1M',
};

interface MaxTokenSliderProps {
  defaultValue?: number;
  onChange?: (value: number) => void;
  value?: number;
}

const MaxTokenSlider = memo<MaxTokenSliderProps>(({ value, onChange, defaultValue }) => {
  const { t } = useTranslation('setting');

  const [token, setTokens] = useMergeState(0, {
    defaultValue,
    onChange,
    value: value,
  });

  const [powValue, setPowValue] = useMergeState(0, {
    defaultValue: exponent(typeof defaultValue === 'undefined' ? 0 : defaultValue / 1024),
    value: exponent(typeof value === 'undefined' ? 0 : value / 1024),
  });

  const updateWithPowValue = (value: number) => {
    setPowValue(value);

    setTokens(getRealValue(value) === 1 ? 0 : power1024(value));
  };

  const updateWithRealValue = (value: number) => {
    setTokens(Math.round(value));

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
          step={null}
          tooltip={{
            formatter: (x) => {
              if (typeof x === 'undefined') return;
              if (x === 0) return t('llm.customModelCards.modelConfig.tokens.unlimited');

              let value = getRealValue(x);
              if (value < 125) return value.toFixed(0) + 'K';
              else if (value < 1024) return ((value * 1024) / 1000).toFixed(0) + 'k';
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
