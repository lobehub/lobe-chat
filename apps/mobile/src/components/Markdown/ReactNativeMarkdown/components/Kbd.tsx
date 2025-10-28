import { memo } from 'react';
import { Components } from 'react-markdown';
import { Text } from 'react-native';

import { useStyles } from '../style';

const Kbd: Components['kbd'] = memo(({ children }) => {
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
