import { Icon, IconProps } from '@lobehub/ui';
import { SelectProps } from 'antd';
import { type CSSProperties, ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import useControlledState from 'use-merge-value';

import { useStyles } from './styles';

export interface SelectWithImgOptionItem {
  icon?: IconProps['icon'];
  img: string;
  label: ReactNode;
  value: string;
}

export interface SelectWithImgProps {
  className?: string;
  classNames?: {
    img?: string;
  };
  defaultValue?: SelectProps['defaultValue'];
  height: number;
  onChange?: (value: this['value']) => void;
  options?: SelectWithImgOptionItem[];
  style?: CSSProperties;

  styles?: {
    img?: CSSProperties;
  };
  value?: SelectProps['value'];
  width: number;
}

const SelectWithImg = memo<SelectWithImgProps>(
  ({
    className,
    style,
    value,
    defaultValue,
    onChange,
    options,
    width,
    height,
    styles: outStyles = {},
    classNames = {},
  }) => {
    const [currentValue, setCurrentValue] = useControlledState<string>(defaultValue, {
      defaultValue,
      onChange,
      value,
    });

    const { styles, cx } = useStyles();

    return (
      <Flexbox className={className} gap={16} horizontal style={style}>
        {options?.map((item) => {
          const isActive = item.value === currentValue;
          return (
            <Flexbox
              align={'center'}
              className={cx(styles.container, isActive && styles.active)}
              gap={4}
              key={item.value}
              onClick={() => setCurrentValue(item.value)}
            >
              <div
                className={cx(styles.imgCtn, isActive && styles.imgActive, classNames.img)}
                style={{
                  ...outStyles.img,
                  height,
                  width,
                }}
              >
                <div
                  className={styles.img}
                  style={{
                    backgroundImage: `url(${item.img})`,
                    backgroundSize: 'contain',
                    height,
                    width,
                  }}
                />
              </div>
              <Flexbox align={'center'} gap={4} horizontal>
                {item.icon && <Icon icon={item.icon} />}
                {item.label}
              </Flexbox>
            </Flexbox>
          );
        })}
      </Flexbox>
    );
  },
);

export default SelectWithImg;
