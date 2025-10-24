import { PageContainer, Text } from '@lobehub/ui-rn';
import type { ReactNode } from 'react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';

import { DRAWER_WIDTH } from '@/_const/theme';
import { useGlobalStore } from '@/store/global';
import { isIOS } from '@/utils/detection';

import TopicList from './components/TopicList';
import { useStyles } from './style';

/**
 * TopicDrawer - 右侧Topic抽屉组件
 * 负责展示当前会话下的所有topic列表
 */
const TopicDrawer = memo(({ children }: { children: ReactNode }) => {
  const { styles } = useStyles();
  const winDim = useWindowDimensions();
  const { t } = useTranslation('topic');

  const [topicDrawerOpen, setTopicDrawerOpen] = useGlobalStore((s) => [
    s.topicDrawerOpen,
    s.setTopicDrawerOpen,
  ]);

  const onOpenDrawer = useCallback(() => setTopicDrawerOpen(true), [setTopicDrawerOpen]);
  const onCloseDrawer = useCallback(() => setTopicDrawerOpen(false), [setTopicDrawerOpen]);

  return (
    <Drawer
      drawerPosition="right"
      drawerStyle={[
        styles.drawerStyle,
        styles.drawerBackground,
        { width: Math.round(Math.min(DRAWER_WIDTH, winDim.width * 0.8)) },
      ]}
      drawerType={isIOS ? 'slide' : 'front'}
      hideStatusBarOnOpen={false}
      onClose={() => {
        onCloseDrawer();
      }}
      onOpen={() => {
        onOpenDrawer();
      }}
      open={topicDrawerOpen}
      overlayStyle={styles.drawerOverlay}
      renderDrawerContent={() => (
        <PageContainer left={<Text>{t('title')}</Text>} style={styles.drawerBackground}>
          <TopicList />
        </PageContainer>
      )}
      swipeEdgeWidth={50}
      swipeEnabled={true}
      swipeMinDistance={10}
      swipeMinVelocity={100}
    >
      {children}
    </Drawer>
  );
});

TopicDrawer.displayName = 'TopicDrawer';

export default TopicDrawer;
