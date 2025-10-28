import { memo } from 'react';
import { Components } from 'react-markdown';
import { Text } from 'react-native';

import { useStyles } from '../style';

const EM: Components['em'] = memo(({ children }) => {
  const { styles } = useStyles();
  return <Text style={[styles.text, styles.em]}>{children}</Text>;
});

export default EM;
