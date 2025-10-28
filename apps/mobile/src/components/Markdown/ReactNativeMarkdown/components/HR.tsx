import { HR as HRElement } from '@expo/html-elements';
import { memo } from 'react';

import { useStyles } from '../style';

const HR = memo(() => {
  const { styles } = useStyles();
  return <HRElement style={[styles.hr]} />;
});

export default HR;
