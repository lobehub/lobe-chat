import { createStyles } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  header: css``,
  title: css`
    color: ${token.colorTextSecondary};
  `,
}));

interface FormItemProps {
  children: ReactNode;
  label: string;
}
const FormItem = memo<FormItemProps>(({ label, children }) => {
  const { styles } = useStyles();

  return (
    <Flexbox className={styles.header} gap={12}>
      <Flexbox className={styles.title}>{label}</Flexbox>
      <Flexbox>{children}</Flexbox>
    </Flexbox>
  );
});

export default FormItem;
