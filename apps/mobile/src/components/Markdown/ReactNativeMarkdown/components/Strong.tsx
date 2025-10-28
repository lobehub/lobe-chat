import { PropsWithChildren, memo } from 'react';
import { Text } from 'react-native';

import { useStyles } from '../style';

const Strong = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return <Text style={[styles.text, styles.strong]}>{children}</Text>;
});

export default Strong;
