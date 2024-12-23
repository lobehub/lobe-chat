import Link from 'next/link';
import { memo } from 'react';

import { useStyles } from './Item';

const All = memo(() => {
  const { styles } = useStyles();
  return (
    <Link className={styles.container} href={'/settings/provider'}>
      全部
    </Link>
  );
});
export default All;
