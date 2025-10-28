import { PropsWithChildren, memo } from 'react';
import { Text } from 'react-native';

import { useStyles } from '../style';

const EM = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return <Text style={[styles.text, styles.em]}>{children}</Text>;
});

export default EM;
