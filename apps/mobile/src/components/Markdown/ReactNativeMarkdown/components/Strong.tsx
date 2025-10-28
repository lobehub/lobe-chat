import { memo } from 'react';
import { Components } from 'react-markdown';
import { Text } from 'react-native';

import { useStyles } from '../style';

const Strong: Components['strong'] = memo(({ children }) => {
  const { styles } = useStyles();
  return <Text style={[styles.text, styles.strong]}>{children}</Text>;
});

export default Strong;
