import { TopicDisplayMode } from '@lobechat/types';
import { ActionIcon, Block, Flexbox, Tag, Text } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { CalendarIcon, ListIcon, SearchIcon } from 'lucide-react-native';
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
import { useSettingStore } from '@/store/setting';

import TopicList from './components/TopicList';
import { useStyles } from './style';

/**
 * TopicDrawer - 右侧Topic抽屉组件
 * 负责展示当前会话下的所有topic列表
 */
const TopicDrawer = memo(({ children }: { children: ReactNode }) => {
  const { styles } = useStyles();
  const topics = useChatStore(topicSelectors.currentTopicLength);
  const winDim = useWindowDimensions();
  const { t } = useTranslation('topic');
  const router = useRouter();

  const [topicDrawerOpen, setTopicDrawerOpen] = useGlobalStore((s) => [
    s.topicDrawerOpen,
    s.setTopicDrawerOpen,
  ]);

  const [topicDisplayMode, setTopicDisplayMode] = useSettingStore((s) => [
    s.topicDisplayMode,
    s.setTopicDisplayMode,
  ]);

  const onOpenDrawer = useCallback(() => setTopicDrawerOpen(true), [setTopicDrawerOpen]);
  const onCloseDrawer = useCallback(() => setTopicDrawerOpen(false), [setTopicDrawerOpen]);

  // 打开 topic 搜索页面
  const handleOpenSearch = useCallback(() => {
    router.push('/topic/search');
  }, [router]);

  // 切换显示模式
  const handleToggleDisplayMode = useCallback(() => {
    setTopicDisplayMode(
      topicDisplayMode === TopicDisplayMode.Flat ? TopicDisplayMode.ByTime : TopicDisplayMode.Flat,
    );
  }, [topicDisplayMode, setTopicDisplayMode]);

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
        <Block borderRadius={44} flex={1} glass style={[styles.drawerContent]} variant={'outlined'}>
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
              <Flexbox align={'center'} flex={1} gap={8} horizontal style={{ marginLeft: 6 }}>
                <Text fontSize={16} weight={500}>
                  {t('title')}
                </Text>
                {topics > 0 ? <Tag size={'small'}>{topics.toString()}</Tag> : undefined}
              </Flexbox>
              <Flexbox gap={4} horizontal>
                <ActionIcon
                  icon={topicDisplayMode === TopicDisplayMode.Flat ? CalendarIcon : ListIcon}
                  onPress={handleToggleDisplayMode}
                  size={{
                    blockSize: 36,
                    borderRadius: 36,
                    size: 22,
                  }}
                />
                <ActionIcon
                  icon={SearchIcon}
                  onPress={handleOpenSearch}
                  size={{
                    blockSize: 36,
                    borderRadius: 36,
                    size: 22,
                  }}
                />
              </Flexbox>
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
