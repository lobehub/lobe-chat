import { memo } from 'react';

import Divider from '@/components/Divider';

import { useStyles } from '../style';

const HR = memo(() => {
  const { styles } = useStyles();
  return <Divider style={styles.hr} />;
});

export default HR;
