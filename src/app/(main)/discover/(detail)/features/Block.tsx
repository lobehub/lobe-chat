import { Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  more: css`
    display: flex;
    align-items: center;
    color: ${token.colorTextSecondary};
  `,
  title: css`
    margin-block: 0;
    font-size: 16px;
    font-weight: bold;
    line-height: 1.2;
  `,
}));

interface BlockProps extends FlexboxProps {
  more?: string;
  onMoreClick?: () => void;
  title: string;
}

const Block = memo<BlockProps>(({ title, more, onMoreClick, children, ...rest }) => {
  const { styles } = useStyles();

  return (
    <Flexbox gap={16} style={{ position: 'relative' }} width={'100%'}>
      <Flexbox align={'center'} gap={16} horizontal justify={'space-between'} width={'100%'}>
        <h2 className={styles.title}>{title}</h2>
        {onMoreClick && (
          <Button className={styles.more} onClick={onMoreClick} type={'text'}>
            <span>{more}</span>
            <Icon icon={ChevronRight} />
          </Button>
        )}
      </Flexbox>
      <Flexbox {...rest}>{children}</Flexbox>
    </Flexbox>
  );
});

export default Block;
