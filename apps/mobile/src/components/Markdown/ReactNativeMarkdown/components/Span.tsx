import { PropsWithChildren, memo } from 'react';
import { Text } from 'react-native';

import { useStyles } from '../style';

const Span = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return <Text style={styles.text}>{children}</Text>;
});

export default Span;
