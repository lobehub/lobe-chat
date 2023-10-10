import { Divider } from 'antd';
import { createStyles } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Center } from 'react-layout-kit';

const useStyles = createStyles(
  ({ css, token }) => css`
    font-size: 14px;
    color: ${token.colorTextDescription};
  `,
);

const Footer = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();
  return (
    <Center style={{ maxWidth: 600, width: ' 100%' }}>
      <Divider>
        <span className={styles}>{children}</span>
      </Divider>
    </Center>
  );
});

export default Footer;
