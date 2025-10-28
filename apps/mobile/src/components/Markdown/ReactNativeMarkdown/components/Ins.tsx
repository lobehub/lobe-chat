import { PropsWithChildren, memo } from 'react';
import { Text } from 'react-native';

import { useStyles } from '../style';

const Ins = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return <Text style={[styles.text, styles.ins]}>{children}</Text>;
});

export default Ins;
