import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useStyles } from './Item';

const All = memo(() => {
  const { styles } = useStyles();
  return (
    <Flexbox className={styles.container} gap={8} horizontal>
      全部
    </Flexbox>
  );
});
export default All;
