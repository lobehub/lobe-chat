import type { ReactNode } from 'react';
import { Children, ReactElement, cloneElement, isValidElement } from 'react';
import { Text, View, type ViewProps } from 'react-native';

import { useStyles } from './style';

interface SettingGroupProps extends ViewProps {
  title?: ReactNode;
}

export const SettingGroup = ({ children, style, title, ...rest }: SettingGroupProps) => {
  const { styles } = useStyles();
  const items = Children.toArray(children);

  const newItems = items.map((child, index) => {
    if (isValidElement(child)) {
      const isLast = index === items.length - 1;
      return cloneElement(child as ReactElement<any>, { isLast });
    }
    return child;
  });

  return (
    <View {...rest}>
      {title && (typeof title === 'string' ? <Text style={styles.title}>{title}</Text> : title)}
      <View style={[styles.container, style]}>{newItems}</View>
    </View>
  );
};
