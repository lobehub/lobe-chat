import React, { ReactElement } from 'react';
import { View, type ViewProps, Text } from 'react-native';

import { useStyles } from './style';

interface SettingGroupProps extends ViewProps {
  title?: React.ReactNode;
}

export const SettingGroup = ({ children, style, title, ...rest }: SettingGroupProps) => {
  const { styles } = useStyles();
  const items = React.Children.toArray(children);

  const newItems = items.map((child, index) => {
    if (React.isValidElement(child)) {
      const isLast = index === items.length - 1;
      return React.cloneElement(child as ReactElement, { isLast });
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
