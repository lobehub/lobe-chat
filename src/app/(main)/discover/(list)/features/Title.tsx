'use client';

import { Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

const useStyles = createStyles(({ css, responsive, token }) => ({
  more: css`
    display: flex;
    align-items: center;
    color: ${token.colorTextSecondary};
  `,
  title: css`
    margin-block-start: 0.5em;
    font-size: 24px;
    font-weight: 600;
    ${responsive.mobile} {
      font-size: 20px;
    }
  `,
}));

interface TitleProps extends FlexboxProps {
  more?: string;
  onMoreClick?: () => void;
}

const Title = memo<TitleProps>(({ children, onMoreClick, more }) => {
  const { styles } = useStyles();
  return (
    <Flexbox align={'center'} gap={16} horizontal justify={'space-between'} width={'100%'}>
      <h2 className={styles.title}>{children}</h2>
      {onMoreClick && (
        <Button
          className={styles.more}
          onClick={onMoreClick}
          style={{ paddingInline: 6 }}
          type={'text'}
        >
          <span>{more}</span>
          <Icon icon={ChevronRight} />
        </Button>
      )}
    </Flexbox>
  );
});

export default Title;
