import { LoadingOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    padding: 4px 8px;

    color: ${token.colorTextSecondary};

    background: ${token.colorFillTertiary};
    border: 1px solid ${token.colorBorder};
    border-radius: 6px;
  `,
}));
const FunctionMessage = memo(() => {
  const { t } = useTranslation('plugin');
  const { styles } = useStyles();
  return (
    <Flexbox className={styles.container} gap={8} horizontal>
      <div>
        <LoadingOutlined />
      </div>
      {t('pluginLoading')}
    </Flexbox>
  );
});

export default FunctionMessage;
