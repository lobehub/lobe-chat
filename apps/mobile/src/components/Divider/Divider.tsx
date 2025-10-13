import { memo } from 'react';
import { View } from 'react-native';

import { useStyles } from './style';
import type { DividerProps } from './type';

const Divider = memo<DividerProps>(({ type = 'horizontal', style, ...rest }) => {
  const { styles } = useStyles();

  return (
    <View style={[type === 'horizontal' ? styles.horizontal : styles.vertical, style]} {...rest} />
  );
});

Divider.displayName = 'Divider';

export default Divider;
