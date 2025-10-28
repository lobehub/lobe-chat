import { memo } from 'react';
import { Components } from 'react-markdown';
import { Text } from 'react-native';

import { useStyles } from '../style';

const Span: Components['span'] = memo(({ children }) => {
  const { styles } = useStyles();
  return <Text style={styles.text}>{children}</Text>;
});

export default Span;
