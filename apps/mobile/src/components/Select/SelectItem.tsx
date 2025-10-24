import { memo } from 'react';

import { useStyles } from '@/components/Select/style';

import Flexbox from '../Flexbox';
import Icon from '../Icon';
import Text, { type TextProps } from '../Text';
import type { SelectOptionItem, SelectSize } from './type';

const SelectItem = memo<SelectOptionItem & { size?: SelectSize; textProps?: Partial<TextProps> }>(
  ({ size = 'middle', icon, title, disabled, iconSize, textProps }) => {
    const { styles } = useStyles({ size });
    return (
      <Flexbox
        align={'center'}
        disabled={disabled}
        flex={1}
        gap={8}
        horizontal
        justify={'flex-start'}
      >
        {icon && <Icon icon={icon} size={iconSize || styles.sizeStyles.fontSize} />}
        {typeof title === 'string' ? (
          <Text
            ellipsis
            fontSize={styles.sizeStyles.fontSize}
            type={disabled ? 'secondary' : undefined}
            {...textProps}
          >
            {title}
          </Text>
        ) : (
          title
        )}
      </Flexbox>
    );
  },
);

SelectItem.displayName = 'SelectItem';

export default SelectItem;
