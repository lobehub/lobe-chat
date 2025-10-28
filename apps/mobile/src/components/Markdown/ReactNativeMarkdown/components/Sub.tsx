import { PropsWithChildren, memo } from 'react';
import { Text, View } from 'react-native';

import { useStyles } from '../style';

const Sub = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <View pointerEvents={'box-none'} style={styles.sub}>
      <Text style={[styles.text, styles.sub]}>{children}</Text>
    </View>
  );
});

export default Sub;
