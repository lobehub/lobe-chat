import { memo } from 'react';
import { Components } from 'react-markdown';
import { Text, View } from 'react-native';

import { useStyles } from '../style';

const Sub: Components['sub'] = memo(({ children }) => {
  const { styles } = useStyles();
  return (
    <View pointerEvents={'box-none'} style={styles.sub}>
      <Text style={[styles.text, styles.sub]}>{children}</Text>
    </View>
  );
});

export default Sub;
