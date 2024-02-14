import { createStyles, useResponsive } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SettingList, { SettingListProps } from '../../features/SettingList';
import UpgradeAlert from '../../features/UpgradeAlert';

const useStyles = createStyles(({ stylish, token, css }) => ({
  body: stylish.noScrollbar,
  container: css`
    border-inline-end: 1px solid ${token.colorBorder};
  `,
  logo: css`
    fill: ${token.colorText};
  `,
  top: css`
    font-size: 20px;
    font-weight: bold;
  `,
}));

const SideBar = memo<SettingListProps>(({ activeTab }) => {
  const { styles } = useStyles();

  const { t } = useTranslation('common');
  const { mobile } = useResponsive();

  return (
    <Flexbox className={styles.container} width={280}>
      <Flexbox className={styles.top} padding={16}>
        {t('setting')}
      </Flexbox>
      <Flexbox gap={8} style={{ paddingInline: 8 }}>
        <UpgradeAlert />
        <SettingList activeTab={activeTab} mobile={mobile} />
      </Flexbox>
    </Flexbox>
  );
});

export default SideBar;
