import { PropsWithChildren, memo } from 'react';
import { Text, View } from 'react-native';

import { useStyles } from '../style';

const Sup = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <View style={styles.sup}>
      <Text style={[styles.text, styles.sup]}>{children}</Text>
    </View>
  );
});

export default Sup;
