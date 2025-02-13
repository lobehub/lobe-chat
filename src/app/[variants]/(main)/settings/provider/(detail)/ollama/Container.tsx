import { ActionIcon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { XIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token, responsive }) => ({
  close: css`
    position: absolute;
    inset-block-start: 16px;
    inset-inline-end: 16px;
  `,
  container: css`
    position: relative;

    width: min(50vw, 600px);
    padding-inline: 40px;
    border: 1px solid ${token.colorBorderBg};
    border-radius: 8px;

    background: ${token.colorBgContainer};

    ${responsive.mobile} {
      width: 100%;
      padding-inline: 12px;
    }
  `,
}));

const Container = ({
  setError,
  children,
}: {
  children: ReactNode;
  setError: (error?: any) => void;
}) => {
  const { styles } = useStyles();
  const [show, setShow] = useState(true);

  return (
    show && (
      <Flexbox className={styles.container}>
        <ActionIcon
          className={styles.close}
          icon={XIcon}
          onClick={() => {
            setShow(false);
            setError(undefined);
          }}
        />
        {children}
      </Flexbox>
    )
  );
};

export default Container;
