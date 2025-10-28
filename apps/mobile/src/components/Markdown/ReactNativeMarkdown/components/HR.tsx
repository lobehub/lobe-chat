import { memo } from 'react';
import { Components } from 'react-markdown';

import Divider from '@/components/Divider';

import { useStyles } from '../style';

const HR: Components['hr'] = memo(() => {
  const { styles } = useStyles();
  return <Divider style={styles.hr} />;
});

export default HR;
