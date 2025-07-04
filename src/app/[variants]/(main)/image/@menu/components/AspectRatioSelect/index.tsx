'use client';

import { Block, Grid, GridProps, Text } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Center } from 'react-layout-kit';
import useMergeState from 'use-merge-value';

export interface AspectRatioSelectProps extends Omit<GridProps, 'children' | 'onChange'> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options?: { label?: string; value: string }[];
}

const AspectRatioSelect = memo<AspectRatioSelectProps>(
  ({ options, onChange, value, defaultValue }) => {
    const theme = useTheme();
    const [active, setActive] = useMergeState('', {
      defaultValue,
      value,
      onChange,
    });
    return (
      <Block padding={4} variant={'filled'}>
        <Grid gap={4} maxItemWidth={48} rows={16}>
          {options?.map((item) => {
            const isActive = active === item.value;
            const [width, height] = item.value.split(':').map(Number);
            const isWidthGreater = width > height;

            return (
              <Block
                align={'center'}
                clickable
                gap={4}
                justify={'center'}
                key={item.value}
                onClick={() => {
                  setActive(item.value);
                  onChange?.(item.value);
                }}
                padding={8}
                shadow={isActive && !theme.isDarkMode}
                style={{
                  backgroundColor: isActive ? theme.colorBgElevated : 'transparent',
                }}
                variant={'filled'}
              >
                <Center height={16} style={{ marginTop: 4 }} width={16}>
                  <div
                    style={{
                      border: `2px solid ${isActive ? theme.colorText : theme.colorTextDescription}`,
                      aspectRatio: `${width} / ${height}`,
                      width: isWidthGreater ? 16 : undefined,
                      height: isWidthGreater ? undefined : 16,
                      borderRadius: 3,
                    }}
                  />
                </Center>
                <Text fontSize={12} type={isActive ? undefined : 'secondary'}>
                  {item.label || item.value}
                </Text>
              </Block>
            );
          })}
        </Grid>
      </Block>
    );
  },
);

export default AspectRatioSelect;
