import { Del as DelElement } from '@expo/html-elements';
import { PropsWithChildren, memo } from 'react';

import { useStyles } from '../style';

const Del = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return <DelElement style={[styles.text, styles.del]}>{children}</DelElement>;
});

export default Del;
