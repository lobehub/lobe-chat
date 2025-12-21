'use client';

import { Skeleton } from '@lobehub/ui';
import { SkeletonProps } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';

const useStyles = createStyles(
  ({ css, responsive }) => css`
    ${responsive.mobile} {
      padding: 16px;
    }
  `,
);

const SkeletonLoading = memo<SkeletonProps>(
  ({ className, classNames, styles: customStyles, ...rest }) => {
    const { cx, styles } = useStyles();

    return (
      <Skeleton
        active
        className={cx(styles, className)}
        classNames={classNames as any}
        paragraph={{ rows: 8 }}
        styles={customStyles as any}
        {...rest}
      />
    );
  },
);

export default SkeletonLoading;
