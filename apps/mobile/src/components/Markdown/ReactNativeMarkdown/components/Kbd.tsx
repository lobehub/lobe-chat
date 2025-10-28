import { PropsWithChildren, memo } from 'react';
import { Text } from 'react-native';

import { useStyles } from '../style';

const Kbd = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <Text style={[styles.text, styles.code]}>
      <Text style={{ fontSize: 8 }}> </Text>
      {children}
      <Text style={{ fontSize: 8 }}> </Text>
    </Text>
  );
});

export default Kbd;
