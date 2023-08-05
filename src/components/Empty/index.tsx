import { ActionIcon, DivProps } from '@lobehub/ui';
import { X } from 'lucide-react';
import { memo, useState } from 'react';

import { useStyles } from './style';

interface EmptyProps extends DivProps {
  cover: string;
  desc: string;
  title: string;
}

const Empty = memo<EmptyProps>(({ cover, title, desc, ...props }) => {
  const [visiable, setVisiable] = useState(true);
  const { styles } = useStyles();
  if (!visiable) return null;
  return (
    <div className={styles.container} {...props}>
      <ActionIcon
        className={styles.close}
        icon={X}
        onClick={() => setVisiable(false)}
        size={{ blockSize: 24, fontSize: 16 }}
      />
      {cover && <img alt="empty" src={cover} width="100%" />}
      <div className={styles.content}>
        {title && <h3>{title}</h3>}
        {desc && <p className={styles.desc}>{desc}</p>}
      </div>
    </div>
  );
});

export default Empty;
