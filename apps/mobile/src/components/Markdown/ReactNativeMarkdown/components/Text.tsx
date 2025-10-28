import { PropsWithChildren, memo } from 'react';
import { Text as RNText } from 'react-native';

import { useStyles } from '../style';

const Text = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return <RNText style={styles.text}>{children}</RNText>;
});

export default Text;
