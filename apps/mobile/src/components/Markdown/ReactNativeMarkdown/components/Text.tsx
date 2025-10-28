import { memo } from 'react';
import { Components } from 'react-markdown';
import { Text as RNText } from 'react-native';

import { useStyles } from '../style';

const Text: Components['text'] = memo(({ children }) => {
  const { styles } = useStyles();
  return <RNText style={styles.text}>{children}</RNText>;
});

export default Text;
