import { Button, ListItem, Switch, Text } from '@lobehub/ui-rn';
import { Minus, Plus, RefreshCw, Settings } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface CustomListItemProps {
  avatar: string | ReactNode;
  description?: string;
  extra?: ReactNode;
  onPress?: () => void;
  style?: 'default' | 'compact' | 'expanded' | 'card';
  title: string;
}

const styles = StyleSheet.create({
  cardContainer: {
    elevation: 2,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  compactAvatar: {
    borderRadius: 16,
    height: 32,
    width: 32,
  },
  compactContainer: {
    padding: 8,
  },
  compactTitle: {
    fontSize: 14,
  },
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  customAvatar: {
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  customContainer: {
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 4,
    padding: 12,
  },
  customDescription: {
    color: '#8E8E93',
    fontSize: 14,
  },
  customInfo: {
    flex: 1,
    marginLeft: 12,
  },
  customTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  downloadInfo: {
    alignItems: 'flex-end',
    minWidth: 90,
  },
  downloadSubtext: {
    color: '#8E8E93',
    fontSize: 10,
  },
  downloadText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  expandedAvatar: {
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  expandedContainer: {
    padding: 16,
  },
  expandedTitle: {
    fontSize: 18,
  },
  lightContainer: {
    backgroundColor: '#F2F2F7',
  },
  lightSecondaryText: {
    color: '#6D6D70',
  },
  lightStyleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5EA',
    borderWidth: 1,
  },
  lightText: {
    color: '#000000',
  },
  lightTips: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5EA',
    borderWidth: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  networkInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  networkText: {
    color: '#8E8E93',
    fontSize: 10,
  },
  progressBar: {
    backgroundColor: '#2C2C2E',
    borderRadius: 1.5,
    height: 3,
    marginTop: 4,
    width: 60,
  },
  progressFill: {
    backgroundColor: '#FF9500',
    borderRadius: 1.5,
    height: '100%',
  },
  section: {
    marginBottom: 32,
  },
  sectionDesc: {
    color: '#8E8E93',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  selectedStyleButton: {
    backgroundColor: '#007AFF',
  },
  selectedStyleButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  signalBar: {
    backgroundColor: '#2C2C2E',
    borderRadius: 1,
    width: 3,
  },
  signalBarActive: {
    backgroundColor: '#34C759',
  },
  signalBars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 2,
  },
  spinning: {
    // 在实际应用中可以添加旋转动画
  },
  storageInfo: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  storageSubtext: {
    color: '#8E8E93',
    fontSize: 10,
  },
  storageText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  styleButton: {
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    flex: 1,
    paddingBlock: 8,
    paddingInline: 12,
  },
  styleButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  styleSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tipDesc: {
    color: '#A0A0A0',
    fontSize: 12,
    lineHeight: 18,
  },
  tipItem: {
    marginBottom: 16,
  },
  tipTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tips: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
  },
  volumeButton: {
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  volumeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    width: 100,
  },
  volumeText: {
    color: '#8E8E93',
    fontSize: 10,
    minWidth: 24,
    textAlign: 'center',
  },
});

const CustomListItem = ({
  title,
  avatar,
  description,
  extra,
  style = 'default',
  onPress,
}: CustomListItemProps) => {
  const containerStyle = [
    styles.customContainer,
    style === 'compact' && styles.compactContainer,
    style === 'expanded' && styles.expandedContainer,
    style === 'card' && styles.cardContainer,
  ];

  const avatarStyle = [
    styles.customAvatar,
    style === 'compact' && styles.compactAvatar,
    style === 'expanded' && styles.expandedAvatar,
  ];

  const titleStyle = [
    styles.customTitle,
    style === 'compact' && styles.compactTitle,
    style === 'expanded' && styles.expandedTitle,
  ];

  return (
    <TouchableOpacity onPress={onPress} style={containerStyle}>
      {typeof avatar === 'string' ? (
        <Text style={[avatarStyle, { textAlign: 'center' }]}>{avatar}</Text>
      ) : (
        <View style={avatarStyle}>{avatar}</View>
      )}
      <View style={styles.customInfo}>
        <Text style={titleStyle}>{title}</Text>
        {description && (
          <Text numberOfLines={style === 'expanded' ? 0 : 1} style={styles.customDescription}>
            {description}
          </Text>
        )}
      </View>
      {extra && <View>{extra}</View>}
    </TouchableOpacity>
  );
};

export default function AdvancedDemo() {
  const [darkMode, setDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [selectedStyle, setSelectedStyle] = useState<'default' | 'compact' | 'expanded' | 'card'>(
    'default',
  );
  const [animatedValue] = useState(new Animated.Value(1));

  const handlePress = useCallback(
    (title: string) => {
      console.log(`点击了: ${title}`);

      // 添加动画反馈
      Animated.sequence([
        Animated.timing(animatedValue, {
          duration: 100,
          toValue: 0.95,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          duration: 100,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [animatedValue],
  );

  const renderVolumeControl = () => (
    <View style={styles.volumeContainer}>
      <Button
        onPress={() => setVolume(Math.max(0, volume - 0.1))}
        size="small"
        style={styles.volumeButton}
        type="default"
      >
        <Minus color="#007AFF" size={16} />
      </Button>
      <Text style={styles.volumeText}>{Math.round(volume * 100)}%</Text>
      <Button
        onPress={() => setVolume(Math.min(1, volume + 0.1))}
        size="small"
        style={styles.volumeButton}
        type="default"
      >
        <Plus color="#007AFF" size={16} />
      </Button>
    </View>
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[styles.container, !darkMode && styles.lightContainer]}
    >
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, !darkMode && styles.lightText]}>自定义样式</Text>
        <Text style={[styles.sectionDesc, !darkMode && styles.lightSecondaryText]}>
          不同的列表项样式变体
        </Text>

        <View style={styles.styleSelector}>
          {(['default', 'compact', 'expanded', 'card'] as const).map((style) => (
            <Button
              key={style}
              onPress={() => setSelectedStyle(style)}
              size="small"
              style={[
                styles.styleButton,
                selectedStyle === style && styles.selectedStyleButton,
                !darkMode && styles.lightStyleButton,
              ]}
              type={selectedStyle === style ? 'primary' : 'default'}
            >
              {style === 'default' && '默认'}
              {style === 'compact' && '紧凑'}
              {style === 'expanded' && '展开'}
              {style === 'card' && '卡片'}
            </Button>
          ))}
        </View>

        <View style={styles.section}>
          <CustomListItem
            avatar="🎨"
            description="这是一个样式预览示例，展示不同样式效果的差异。您可以通过上方的按钮切换不同的样式模式。"
            extra="预览"
            onPress={() => handlePress('样式预览')}
            style={selectedStyle}
            title="样式预览"
          />

          <CustomListItem
            avatar={<Settings color="#007AFF" size={24} />}
            description="配置交互行为和视觉效果"
            extra=">"
            onPress={() => handlePress('交互设置')}
            style={selectedStyle}
            title="交互设置"
          />
        </View>

        <Text style={[styles.sectionTitle, !darkMode && styles.lightText]}>开关控制</Text>
        <Text style={[styles.sectionDesc, !darkMode && styles.lightSecondaryText]}>
          在列表项中集成开关和控制组件
        </Text>
        <View style={styles.section}>
          <ListItem
            avatar="🌙"
            description="切换应用主题颜色"
            extra={<Switch checked={darkMode} onChange={setDarkMode} />}
            onPress={() => setDarkMode(!darkMode)}
            title="深色模式"
          />

          <ListItem
            avatar="🔔"
            description="接收应用推送消息"
            extra={<Switch checked={notificationsEnabled} onChange={setNotificationsEnabled} />}
            onPress={() => setNotificationsEnabled(!notificationsEnabled)}
            title="推送通知"
          />

          <ListItem
            avatar="🔊"
            description="调整应用音量大小"
            extra={renderVolumeControl()}
            onPress={() => handlePress('音量设置')}
            title="音量设置"
          />
        </View>

        <Text style={[styles.sectionTitle, !darkMode && styles.lightText]}>复杂内容</Text>
        <Text style={[styles.sectionDesc, !darkMode && styles.lightSecondaryText]}>
          展示复杂的额外内容组合
        </Text>
        <View style={styles.section}>
          <ListItem
            avatar="💾"
            description="查看和管理设备存储"
            extra={
              <View style={styles.storageInfo}>
                <Text style={styles.storageText}>已用 64.2GB</Text>
                <Text style={styles.storageSubtext}>共 128GB</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '60%' }]} />
                </View>
              </View>
            }
            onPress={() => handlePress('存储空间')}
            title="存储空间"
          />

          <ListItem
            avatar="📥"
            description="正在下载系统更新..."
            extra={
              <View style={styles.downloadInfo}>
                <Text style={styles.downloadText}>45%</Text>
                <Text style={styles.downloadSubtext}>234MB/520MB</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { backgroundColor: '#007AFF', width: '45%' }]}
                  />
                </View>
              </View>
            }
            onPress={() => handlePress('下载进度')}
            title="下载进度"
          />

          <ListItem
            avatar="📶"
            description="Wi-Fi 连接状态良好"
            extra={
              <View style={styles.networkInfo}>
                <View style={styles.signalBars}>
                  {[0, 1, 2, 3].map((index) => (
                    <View
                      key={index}
                      style={[
                        styles.signalBar,
                        { height: (index + 1) * 4 },
                        index < 3 && styles.signalBarActive,
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.networkText}>75 Mbps</Text>
                <RefreshCw color="#007AFF" size={24} style={styles.spinning} />
              </View>
            }
            onPress={() => handlePress('网络状态')}
            title="网络状态"
          />
        </View>

        <Text style={[styles.sectionTitle, !darkMode && styles.lightText]}>动画效果</Text>
        <Text style={[styles.sectionDesc, !darkMode && styles.lightSecondaryText]}>
          带有动画交互效果的列表项
        </Text>
        <View style={styles.section}>
          <Animated.View style={{ transform: [{ scale: animatedValue }] }}>
            <ListItem
              avatar="✨"
              description="点击时有缩放动画效果"
              extra="点击试试"
              onPress={() => handlePress('动画反馈')}
              title="动画反馈"
            />
          </Animated.View>

          <ListItem
            avatar={
              <View style={styles.loadingContainer}>
                <RefreshCw color="#007AFF" size={24} style={styles.spinning} />
              </View>
            }
            description="正在同步数据..."
            extra="同步中"
            onPress={() => handlePress('加载状态')}
            title="加载状态"
          />
        </View>

        <Text style={[styles.sectionTitle, !darkMode && styles.lightText]}>实用技巧</Text>
        <View style={[styles.tips, !darkMode && styles.lightTips]}>
          <View style={styles.tipItem}>
            <Text style={[styles.tipTitle, !darkMode && styles.lightText]}>🎨 样式自定义</Text>
            <Text style={[styles.tipDesc, !darkMode && styles.lightSecondaryText]}>
              通过修改组件样式可以创建不同的视觉效果，适应各种设计需求
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={[styles.tipTitle, !darkMode && styles.lightText]}>🔧 控件集成</Text>
            <Text style={[styles.tipDesc, !darkMode && styles.lightSecondaryText]}>
              在extra区域可以放置Switch、Slider等控制组件，实现丰富的交互
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={[styles.tipTitle, !darkMode && styles.lightText]}>📊 复杂内容</Text>
            <Text style={[styles.tipDesc, !darkMode && styles.lightSecondaryText]}>
              支持进度条、图表等复杂内容展示，满足各种数据可视化需求
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={[styles.tipTitle, !darkMode && styles.lightText]}>✨ 动画交互</Text>
            <Text style={[styles.tipDesc, !darkMode && styles.lightSecondaryText]}>
              结合React Native动画API可以创建流畅的交互体验
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
