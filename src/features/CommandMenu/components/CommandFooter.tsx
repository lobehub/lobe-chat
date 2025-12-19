import { createStyles } from 'antd-style';
import { ArrowUpDown, CornerDownLeft } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css, token }) => ({
  commandFooter: css`
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: flex-end;

    padding-block: 8px;
    padding-inline: 16px;
    border-block-start: 1px solid ${token.colorBorderSecondary};

    background: ${token.colorBgContainer};
  `,
  kbd: css`
    display: inline-flex;
    gap: 4px;
    align-items: center;

    padding-block: 2px;
    padding-inline: 6px;
    border-radius: ${token.borderRadiusSM}px;

    font-size: 11px;
    font-weight: 500;
    line-height: 1.2;
    color: ${token.colorTextSecondary};

    background: ${token.colorFillQuaternary};
  `,
  kbdIcon: css`
    width: 12px;
    height: 12px;
  `,
}));

/**
 * Show avaialble keyboard action for the CMDK Menu.
 */
const CommandFooter = memo(() => {
  const { t } = useTranslation('common');
  const { styles } = useStyles();

  return (
    <div className={styles.commandFooter}>
      <div className={styles.kbd}>
        <CornerDownLeft className={styles.kbdIcon} />
        <span>{t('cmdk.toOpen')}</span>
      </div>
      <div className={styles.kbd}>
        <ArrowUpDown className={styles.kbdIcon} />
        <span>{t('cmdk.toSelect')}</span>
      </div>
    </div>
  );
});

CommandFooter.displayName = 'CommandFooter';

export default CommandFooter;
