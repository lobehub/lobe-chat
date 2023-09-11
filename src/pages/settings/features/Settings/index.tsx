import { GridBackground, Icon, Logo, TabsNav } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { PackageCheck } from 'lucide-react';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';

import pkg from '../../../../../package.json';
import Agent from './Agent';
import Common from './Common';
import LLM from './LLM';

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  background: css`
    position: absolute;
    bottom: -10%;
    left: 0;
    width: 100%;
  `,
  logo: css`
    position: absolute;
    top: 50%;
    left: 32px;
    transform: translateY(-50%);
  `,
  tabs: css`
    position: relative;

    overflow: hidden;

    width: 100%;
    max-width: 1024px;
    height: 160px;
    padding: 4px;

    background: radial-gradient(
      120% 120% at 20% 100%,
      ${isDarkMode ? rgba(token.colorBgContainer, 0.5) : token.colorBgContainer} 32%,
      ${isDarkMode ? token.colorPrimaryBgHover : rgba(token.colorPrimaryBgHover, 0.3)} 50%,
      ${isDarkMode ? token.colorPrimaryHover : rgba(token.colorPrimaryHover, 0.3)} 100%
    );
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
  `,
  tag: css`
    position: absolute;
    top: 6px;
    right: 12px;

    font-family: ${token.fontFamilyCode};
    font-size: 12px;
    color: ${isDarkMode ? token.colorPrimaryBg : token.colorPrimaryActive};

    opacity: 0.5;
  `,
}));

const Settings = memo(() => {
  const { styles, theme } = useStyles();
  const { t } = useTranslation('setting');

  const [tab, setTab] = useGlobalStore((s) => [s.settingsTab, s.switchSettingTabs]);

  return (
    <Center gap={16} width={'100%'}>
      <Flexbox align={'flex-end'} className={styles.tabs} horizontal justify={'center'}>
        <GridBackground
          animation
          className={styles.background}
          colorBack={theme.colorFillSecondary}
          colorFront={theme.colorPrimary}
          random
        />
        <TabsNav
          activeKey={tab}
          items={[
            { key: 'common', label: t('tab.common') },
            { key: 'llm', label: t('tab.llm') },
            { key: 'agent', label: t('tab.agent') },
          ]}
          onChange={(e) => setTab(e as any)}
        />
        <div className={styles.logo}>
          <Logo extra={'Chat'} type={'text'} />
        </div>
        <Flexbox align={'center'} className={styles.tag} gap={4} horizontal>
          <Icon icon={PackageCheck} />
          <div>{`${pkg.version}`}</div>
        </Flexbox>
      </Flexbox>
      {tab === 'common' && <Common />}
      {tab === 'llm' && <LLM />}
      {tab === 'agent' && <Agent />}
    </Center>
  );
});

export default Settings;
