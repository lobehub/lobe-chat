import React from 'react';
import { View, type ViewProps, Text } from 'react-native';

import { useStyles } from './style';

interface ListGroupProps extends ViewProps {
  title?: React.ReactNode;
}

const ListGroup = ({ children, style, title, ...rest }: ListGroupProps) => {
  const { styles } = useStyles();

  return (
    <View {...rest}>
      {title && (typeof title === 'string' ? <Text style={styles.title}>{title}</Text> : title)}
      <View style={[styles.container, style]}>{children}</View>
    </View>
  );
};

export default ListGroup;
