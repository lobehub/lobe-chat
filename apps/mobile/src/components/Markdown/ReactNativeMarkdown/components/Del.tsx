import { memo } from 'react';
import { Components } from 'react-markdown';
import { Text } from 'react-native';

import { useStyles } from '../style';

const Del: Components['del'] = memo(({ children }) => {
  const { styles } = useStyles();
  return <Text style={[styles.text, styles.del]}>{children}</Text>;
});

export default Del;
