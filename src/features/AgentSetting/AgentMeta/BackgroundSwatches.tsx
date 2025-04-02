import { ColorSwatches, ColorSwatchesProps } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_BACKGROUND_COLOR } from '@/const/meta';

interface BackgroundSwatchesProps
  extends Pick<ColorSwatchesProps, 'defaultValue' | 'value' | 'onChange'> {
  onValuesChange?: ColorSwatchesProps['onChange'];
}

const BackgroundSwatches = memo<BackgroundSwatchesProps>(
  ({ defaultValue = DEFAULT_BACKGROUND_COLOR, value, onChange, onValuesChange }) => {
    const theme = useTheme();
    const { t } = useTranslation('color');
    return (
      <ColorSwatches
        colors={[
          {
            color: 'rgba(0, 0, 0, 0)',
            label: t('default'),
          },
          {
            color: theme.red,
            label: t('red'),
          },
          {
            color: theme.orange,
            label: t('orange'),
          },
          {
            color: theme.gold,
            label: t('gold'),
          },
          {
            color: theme.yellow,
            label: t('yellow'),
          },
          {
            color: theme.lime,
            label: t('lime'),
          },
          {
            color: theme.green,
            label: t('green'),
          },
          {
            color: theme.cyan,
            label: t('cyan'),
          },
          {
            color: theme.blue,
            label: t('blue'),
          },
          {
            color: theme.geekblue,
            label: t('geekblue'),
          },
          {
            color: theme.purple,
            label: t('purple'),
          },
          {
            color: theme.magenta,
            label: t('magenta'),
          },
          {
            color: theme.volcano,
            label: t('volcano'),
          },
        ]}
        defaultValue={defaultValue}
        enableColorPicker
        onChange={(v) => {
          onChange?.(v);
          onValuesChange?.(v);
        }}
        texts={{
          custom: t('custom'),
          presets: t('presets'),
        }}
        value={value}
      />
    );
  },
);

export default BackgroundSwatches;
