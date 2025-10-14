import { View } from 'react-native';

import Text from '../Text';
import { useStyles } from './style';
import type { ListGroupProps } from './type';

const ListGroup = ({ children, style, title, ...rest }: ListGroupProps) => {
  const { styles } = useStyles();

  return (
    <View {...rest}>
      {title && (typeof title === 'string' ? <Text style={styles.title}>{title}</Text> : title)}
      <View style={[styles.container, style]}>{children}</View>
    </View>
  );
};

ListGroup.displayName = 'ListGroup';

export default ListGroup;
