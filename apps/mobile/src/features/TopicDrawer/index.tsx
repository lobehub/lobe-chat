import { ActionIcon, Block, Flexbox, Text } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { SearchIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HEADER_HEIGHT } from '@/_const/common';
import { DRAWER_WIDTH } from '@/_const/theme';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/slices/topic/selectors';
import { useGlobalStore } from '@/store/global';

import TopicList from './components/TopicList';
import { useStyles } from './style';

/**
 * TopicDrawer - 右侧Topic抽屉组件
 * 负责展示当前会话下的所有topic列表
 */
const TopicDrawer = memo(({ children }: { children: ReactNode }) => {
  const { styles, theme } = useStyles();
  const topics = useChatStore(topicSelectors.currentTopicLength);
  const winDim = useWindowDimensions();
  const { t } = useTranslation('topic');
  const router = useRouter();

  const [topicDrawerOpen, setTopicDrawerOpen] = useGlobalStore((s) => [
    s.topicDrawerOpen,
    s.setTopicDrawerOpen,
  ]);

  const onOpenDrawer = useCallback(() => setTopicDrawerOpen(true), [setTopicDrawerOpen]);
  const onCloseDrawer = useCallback(() => setTopicDrawerOpen(false), [setTopicDrawerOpen]);

  // 打开 topic 搜索页面
  const handleOpenSearch = useCallback(() => {
    router.push('/topic/search');
  }, [router]);

  return (
    <Drawer
      drawerPosition="right"
      drawerStyle={[
        styles.drawerStyle,
        styles.drawerBackground,
        { width: Math.round(Math.min(DRAWER_WIDTH, winDim.width * 0.8)) },
      ]}
      drawerType={'front'}
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
        <Block
          borderRadius={44}
          flex={1}
          style={{
            backgroundColor: theme.colorBgLayout,
          }}
          variant={'outlined'}
        >
          <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }} testID="page-container">
            <Flexbox
              align={'center'}
              gap={8}
              height={HEADER_HEIGHT}
              horizontal
              justify={'space-between'}
              paddingBlock={4}
              paddingInline={8}
            >
              <Flexbox gap={4} horizontal style={{ marginLeft: 6 }}>
                <Text>{t('title')}</Text>
                {topics > 0 ? <Text>{topics}</Text> : undefined}
              </Flexbox>
              <ActionIcon
                icon={SearchIcon}
                onPress={handleOpenSearch}
                size={{
                  blockSize: 32,
                  borderRadius: 16,
                  size: 16,
                }}
              />
            </Flexbox>
            <TopicList />
          </SafeAreaView>
        </Block>
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
