import { ActionIcon, type ActionIconProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import React, { ReactNode } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

const useStyles = createStyles(({ token, css }) => ({
  header: css`
    border-block-end: 1px solid ${token.colorBorderSecondary};
  `,
  title: css`
    font-weight: 550;
  `,
}));

interface HeaderProps extends Omit<FlexboxProps, 'title' | 'children'> {
  actions?: ActionIconProps[];
  extra?: ReactNode;
  title?: ReactNode;
}

const Header = ({ title, actions = [], extra, ...rest }: HeaderProps) => {
  const { styles } = useStyles();

  return (
    <Flexbox
      align={'center'}
      className={styles.header}
      flex={'none'}
      height={46}
      horizontal
      justify={'space-between'}
      paddingInline={16}
      {...rest}
    >
      <div className={styles.title}>{title}</div>
      <Flexbox align={'center'} gap={4} horizontal>
        {extra}
        {actions.map((action, index) => (
          <ActionIcon {...action} key={index} size={{ blockSize: 28, size: 16 }} />
        ))}
      </Flexbox>
    </Flexbox>
  );
};

export default Header;
