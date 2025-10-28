import { PropsWithChildren, memo } from 'react';
import { Text } from 'react-native';

import { useStyles } from '../style';

const Html = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return <Text style={[styles.text, styles.code]}>{children}</Text>;
});

export default Html;
