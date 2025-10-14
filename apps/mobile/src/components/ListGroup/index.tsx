import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import Text from '../Text';
import { useStyles } from './style';

interface ListGroupProps extends ViewProps {
  title?: ReactNode;
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
