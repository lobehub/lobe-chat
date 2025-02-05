import { ActionIcon, type ActionIconProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import React from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ token, css }) => ({
  header: css`
    border-block-end: 1px solid ${token.colorBorderSecondary};
  `,
  title: css`
    font-weight: 550;
  `,
}));

interface HeaderProps {
  actions?: ActionIconProps[];
  title?: string;
}

const Header = ({ title, actions = [] }: HeaderProps) => {
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
    >
      <div className={styles.title}>{title}</div>
      <Flexbox align={'center'} gap={4} horizontal>
        {actions.map((action, index) => (
          <ActionIcon
            {...action}
            key={action.title || index}
            size={{ blockSize: 28, fontSize: 16 }}
          />
        ))}
      </Flexbox>
    </Flexbox>
  );
};

export default Header;
