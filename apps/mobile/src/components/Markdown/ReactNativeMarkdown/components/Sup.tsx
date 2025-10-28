import { memo } from 'react';
import { Components } from 'react-markdown';
import { Text, View } from 'react-native';

import { useStyles } from '../style';

const Sup: Components['sup'] = memo(({ children }) => {
  const { styles } = useStyles();
  return (
    <View pointerEvents={'box-none'} style={styles.sup}>
      <Text style={[styles.text, styles.sup]}>{children}</Text>
    </View>
  );
});

export default Sup;
