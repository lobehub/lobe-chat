import { memo } from 'react';
import { Components } from 'react-markdown';
import { Text } from 'react-native';

import { useStyles } from '../style';

const skipWrapperTags = new Set(['img', 'video']);

const P: Components['p'] = memo(({ children }) => {
  const { styles } = useStyles();
  if (
    typeof children === 'object' &&
    skipWrapperTags.has((children as any)?.props?.node?.tagName)
  ) {
    return children;
  }
  return <Text style={[styles.text, styles.paragraph]}>{children}</Text>;
});

export default P;
