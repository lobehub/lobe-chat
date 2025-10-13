import { ReactNode } from 'react';

import Text from '../../Text';
import { useMarkdownContext } from '../context';

export const BreakRenderer = (): ReactNode => {
  const { styles } = useMarkdownContext();

  return <Text style={styles.break}>{'\n'}</Text>;
};
