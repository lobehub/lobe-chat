import { copyToClipboard } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css, token }) => ({
  copyable: css`
    cursor: pointer;
    width: 100%;
    margin-block: 2px;
    padding: 4px;

    &:hover {
      border-radius: 6px;
      background: ${token.colorFillTertiary};
    }
  `,
}));

interface ValueCellProps {
  value: string;
}

const ValueCell = memo<ValueCellProps>(({ value }) => {
  const { message } = App.useApp();
  const { t } = useTranslation('common');
  const { styles } = useStyles();

  return (
    <div
      className={styles.copyable}
      onClick={async () => {
        await copyToClipboard(value);
        message.success(t('copySuccess'));
      }}
    >
      {value}
    </div>
  );
});

export default ValueCell;
