import { Icon, IconProps } from '@lobehub/ui';
import { SelectProps } from 'antd';
import { type CSSProperties, ReactNode, memo, useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useStyles } from './styles';

export interface SelectWithImgOptionItem {
  icon?: IconProps['icon'];
  img: string;
  label: ReactNode;
  value: string;
}

export interface SelectWithImgProps {
  className?: string;
  defaultValue?: SelectProps['defaultValue'];
  imgClassName?: string;
  imgStyle?: CSSProperties;
  onChange?: (value: this['value']) => void;
  options?: SelectWithImgOptionItem[];
  size?: number;
  style?: CSSProperties;
  value?: SelectProps['value'];
}

const SelectWithImg = memo<SelectWithImgProps>(
  ({
    className,
    style,
    value,
    defaultValue,
    onChange,
    options,
    size = 100,
    imgStyle,
    imgClassName,
  }) => {
    const [currentValue, setCurrentValue] = useState(value || defaultValue);
    const { styles, cx } = useStyles();

    useEffect(() => {
      onChange?.(currentValue);
    }, [currentValue]);

    return (
      <Flexbox className={className} gap={8} horizontal style={style}>
        {options?.map((item) => {
          const isActive = value ? item.value === value : item.value === currentValue;
          return (
            <Flexbox
              align={'center'}
              className={cx(styles.container, isActive && styles.active)}
              gap={4}
              key={item.value}
              onClick={() => setCurrentValue(item.value)}
            >
              <img
                alt={item.value}
                className={imgClassName}
                src={item.img}
                style={imgStyle}
                width={size}
              />
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
