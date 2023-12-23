import { CSSProperties, ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { MAX_SIZE_DESKTOP, MIN_IMAGE_SIZE, useStyles } from './style';

interface GridProps {
  children: ReactNode;
  className?: string;
  col?: number;
  gap?: number;
  max?: number;
  min?: number;
  style?: CSSProperties;
}

const Grid = memo<GridProps>(
  ({
    gap = 4,
    col = 3,
    max = MAX_SIZE_DESKTOP,
    min = MIN_IMAGE_SIZE,
    children,
    className,
    style,
  }) => {
    const { styles, cx } = useStyles({ col, gap, max, min });

    return (
      <Flexbox className={cx(styles.container, className)} gap={gap} horizontal style={style}>
        {children}
      </Flexbox>
    );
  },
);

export default Grid;
