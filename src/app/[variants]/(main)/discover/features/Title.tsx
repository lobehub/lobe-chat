'use client';

import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ReactNode, memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  more: css`
    display: flex;
    align-items: center;
    color: ${token.colorTextSecondary};
  `,
  title: css`
    margin-block: 0.2em;
    font-weight: bold;
    line-height: 1.5;
  `,
  title2: css`
    font-size: 18px;
  `,
  title3: css`
    font-size: 16px;
  `,
}));

export interface TitleProps extends FlexboxProps {
  icon?: ReactNode;
  id?: string;
  level?: 2 | 3;
  more?: ReactNode;
  moreLink?: string;
  tag?: ReactNode;
}

const Title = memo<TitleProps>(
  ({ id, tag, children, moreLink, more, level = 2, icon, ...rest }) => {
    const { cx, styles } = useStyles();
    const title = (
      <h2 className={cx(styles.title, styles[`title${level}`])} id={id}>
        {children}
      </h2>
    );
    return (
      <Flexbox
        align={'center'}
        gap={16}
        horizontal
        justify={'space-between'}
        width={'100%'}
        {...rest}
      >
        {tag || icon ? (
          <Flexbox align={'center'} gap={8} horizontal>
            {icon}
            {title}
            {tag && (
              <Flexbox align={'center'} gap={4} horizontal>
                {tag}
              </Flexbox>
            )}
          </Flexbox>
        ) : (
          title
        )}
        {moreLink && (
          <Link
            className={styles.more}
            href={moreLink}
            target={moreLink.startsWith('http') ? '_blank' : undefined}
          >
            <span style={{ marginRight: 4 }}>{more}</span>
            <Icon icon={ChevronRight} />
          </Link>
        )}
      </Flexbox>
    );
  },
);

export default Title;
