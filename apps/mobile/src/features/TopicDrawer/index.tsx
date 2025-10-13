import { PageContainer } from '@lobehub/ui-rn';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, useWindowDimensions } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';

import { DRAWER_WIDTH } from '@/_const/theme';
import { useGlobalStore } from '@/store/global';

import TopicList from './components/TopicList';
import { useStyles } from './style';

/**
 * TopicDrawer - 右侧Topic抽屉组件
 * 负责展示当前会话下的所有topic列表
 */
const TopicDrawer = memo(({ children }: { children: ReactNode }) => {
  const { styles } = useStyles();
  const winDim = useWindowDimensions();
  const { t } = useTranslation(['topic']);

  const [topicDrawerOpen, setTopicDrawerOpen] = useGlobalStore((s) => [
    s.topicDrawerOpen,
    s.setTopicDrawerOpen,
  ]);

  return (
    <Drawer
      drawerPosition="right"
      drawerStyle={[
        styles.drawerStyle,
        { width: Math.round(Math.min(DRAWER_WIDTH, winDim.width * 0.8)) },
      ]}
      drawerType="slide"
      hideStatusBarOnOpen={false}
      onClose={() => {
        setTopicDrawerOpen(false);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onOpen={() => {
        setTopicDrawerOpen(true);
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      open={topicDrawerOpen}
      overlayStyle={styles.drawerOverlay}
      renderDrawerContent={() => (
        <PageContainer left={<Text style={styles.headerTitle}>{t('title')}</Text>}>
          <TopicList />
        </PageContainer>
      )}
      swipeEdgeWidth={50}
      swipeEnabled={true}
    >
      {children}
    </Drawer>
  );
});

TopicDrawer.displayName = 'TopicDrawer';

export default TopicDrawer;
