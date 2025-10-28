import { A as Link } from '@expo/html-elements';
import { memo } from 'react';
import { Components } from 'react-markdown';

import Tag from '@/components/Tag';

import { useStyles } from '../style';

const A: Components['a'] = memo(({ children, href, ...rest }) => {
  const { styles } = useStyles();

  if (rest['aria-describedby'] === 'footnote-label') {
    return (
      <Tag size={'small'} style={{ transform: [{ scale: 0.8 }] }}>
        {children}
      </Tag>
    );
  }

  if (rest.className === 'data-footnote-backref') {
    return null;
  }

  return (
    <Link href={href} style={[styles.text, styles.link]}>
      {children}
    </Link>
  );
});

export default A;
