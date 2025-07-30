import { View, type ViewProps } from 'react-native';

import { useStyles } from './style';

type ListGroupProps = ViewProps;

const ListGroup = ({ children, style }: ListGroupProps) => {
  const { styles } = useStyles();

  return <View style={[styles.container, style]}>{children}</View>;
};

export default ListGroup;
