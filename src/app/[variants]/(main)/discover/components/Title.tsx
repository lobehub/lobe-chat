'use client';

import { Icon } from '@lobehub/ui';
import { Button, Tag } from 'antd';
import { createStyles } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ReactNode, memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

const useStyles = createStyles(({ css, responsive, token }) => ({
  more: css`
    display: flex;
    align-items: center;
    color: ${token.colorTextSecondary};
  `,
  tag: css`
    flex: none;

    padding-block: 0.1em;
    padding-inline: 0.3em;
    border-radius: ${token.borderRadius}px;

    font-size: 18px;
    font-weight: 500;
    color: ${token.colorTextSecondary};

    background: ${token.colorFillSecondary};
    ${responsive.mobile} {
      font-size: 14px;
    }
  `,
  title: css`
    margin-block-start: 0.5em;
    font-size: 24px;
    font-weight: 600;
    ${responsive.mobile} {
      font-size: 18px;
    }
  `,
}));

interface TitleProps extends FlexboxProps {
  more?: ReactNode;
  moreLink?: string;
  tag?: ReactNode;
}

const Title = memo<TitleProps>(({ tag, children, moreLink, more }) => {
  const { styles } = useStyles();
  const title = <h2 className={styles.title}>{children}</h2>;
  return (
    <Flexbox align={'center'} gap={16} horizontal justify={'space-between'} width={'100%'}>
      {tag ? (
        <Flexbox align={'center'} gap={8} horizontal>
          {title}
          <Tag bordered={false} className={styles.tag}>
            {tag}
          </Tag>
        </Flexbox>
      ) : (
        title
      )}
      {moreLink && (
        <Link href={moreLink} target={moreLink.startsWith('http') ? '_blank' : undefined}>
          <Button className={styles.more} style={{ paddingInline: 6 }} type={'text'}>
            <span>{more}</span>
            <Icon icon={ChevronRight} />
          </Button>
        </Link>
      )}
    </Flexbox>
  );
});

export default Title;
