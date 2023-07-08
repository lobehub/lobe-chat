import { ConfigProvider, Drawer } from 'antd';
import { createStyles } from 'antd-style';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import ReadMode from '@/pages/chat/Config/ReadMode';
import { useChatStore } from '@/store/session';

const useStyles = createStyles(({ css, prefixCls }) => ({
  drawer: css`
    .${prefixCls}-drawer-content-wrapper {
      box-shadow: none;
    }
  `,
}));
const Config = () => {
  const { styles, theme } = useStyles();
  const [showAgentSettings, toggleConfig] = useChatStore(
    (s) => [s.showAgentSettings, s.toggleConfig],
    shallow,
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgElevated: theme.colorBgContainer,
          boxShadow: theme.boxShadowSecondary,
        },
      }}
    >
      <Drawer
        mask={false}
        onClose={() => {
          toggleConfig(false);
        }}
        title={<Flexbox>会话设置</Flexbox>}
        getContainer={false}
        open={showAgentSettings}
        rootClassName={styles.drawer}
        drawerStyle={{ borderLeft: `1px solid ${theme.colorBorder}`, top: 64 }}
      >
        <ReadMode />
      </Drawer>
    </ConfigProvider>
  );
};

export default Config;
