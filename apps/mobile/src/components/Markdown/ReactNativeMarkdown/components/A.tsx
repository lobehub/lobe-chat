import { A as Link } from '@expo/html-elements';
import { memo } from 'react';
import { Components } from 'react-markdown';

import { useStyles } from '../style';

const A: Components['a'] = memo(({ children, href }) => {
  const { styles } = useStyles();
  return (
    <Link href={href} style={[styles.text, styles.link]}>
      {children}
    </Link>
  );
});

export default A;
