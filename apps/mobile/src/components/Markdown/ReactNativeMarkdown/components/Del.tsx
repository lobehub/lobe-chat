import { PropsWithChildren, memo } from 'react';
import { Text } from 'react-native';

import { useStyles } from '../style';

const Del = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return <Text style={[styles.text, styles.del]}>{children}</Text>;
});

export default Del;
