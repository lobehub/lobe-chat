import { Segmented } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import Agent from './Agent';
import Common from './Common';

const useStyles = createStyles(({ css, token }) => ({
  tabs: css`
    padding: 4px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    &:hover {
      border-color: ${token.colorBorder};
    }
  `,
}));

enum Tabs {
  common,
  agent,
}

const Settings = memo(() => {
  const [tab, setTab] = useState<Tabs>(Tabs.common);
  const { styles } = useStyles();
  const { t } = useTranslation('setting');

  return (
    <Center gap={16} width={'100%'}>
      <div className={styles.tabs}>
        <Segmented
          onChange={(e) => setTab(e as Tabs)}
          options={[
            { label: t('tab.common'), value: Tabs.common },
            { label: t('tab.agent'), value: Tabs.agent },
          ]}
          value={tab}
        />
      </div>
      {tab === Tabs.common && <Common />}
      {tab === Tabs.agent && <Agent />}
    </Center>
  );
});

export default Settings;
