import { ListItem, Text, useTheme } from '@lobehub/ui-rn';
import { ScrollView, StyleSheet, View } from 'react-native';

const handlePress = (title: string) => {
  console.log(`点击了: ${title}`);
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingInline: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingBottom: 8,
  },
  timeContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
  },
  tipDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  tipItem: {
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tips: {
    borderRadius: 12,
    padding: 16,
  },
});

export default function BasicDemo() {
  const token = useTheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[styles.container, { backgroundColor: token.colorBgLayout }]}
    >
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: token.colorText }]}>基础列表项</Text>
        <View style={styles.section}>
          <ListItem
            avatar="📝"
            description="最基本的列表项示例"
            onPress={() => handlePress('简单列表项')}
            title="简单列表项"
          />

          <ListItem
            avatar="📄"
            description="这是一个包含详细描述信息的列表项，用来展示长文本的显示效果"
            onPress={() => handlePress('带描述的列表项')}
            title="带描述的列表项"
          />

          <ListItem
            avatar="🔔"
            description="右侧显示额外信息"
            extra="新消息"
            onPress={() => handlePress('带额外内容')}
            title="带额外内容"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: token.colorText }]}>不同状态</Text>
        <View style={styles.section}>
          <ListItem
            avatar="🟢"
            description="用户当前在线"
            extra="在线"
            onPress={() => handlePress('活跃状态')}
            title="活跃状态"
          />

          <ListItem
            avatar="🟡"
            description="用户正在忙碌中"
            extra="忙碌"
            onPress={() => handlePress('忙碌状态')}
            title="忙碌状态"
          />

          <ListItem
            avatar="⚪"
            description="用户已离线"
            extra="离线"
            onPress={() => handlePress('离线状态')}
            title="离线状态"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: token.colorText }]}>时间和计数</Text>
        <View style={styles.section}>
          <ListItem
            avatar="💬"
            description="最新消息内容预览..."
            extra={
              <View style={styles.timeContainer}>
                <Text style={[styles.timeText, { color: token.colorTextSecondary }]}>10:30</Text>
                <View style={[styles.badge, { backgroundColor: token.colorPrimary }]}>
                  <Text style={[styles.badgeText, { color: token.colorText }]}>3</Text>
                </View>
              </View>
            }
            onPress={() => handlePress('聊天会话')}
            title="聊天会话"
          />

          <ListItem
            avatar="👥"
            description="会议室已预订成功"
            extra={
              <View style={styles.timeContainer}>
                <Text style={[styles.timeText, { color: token.colorTextSecondary }]}>昨天</Text>
              </View>
            }
            onPress={() => handlePress('工作群组')}
            title="工作群组"
          />

          <ListItem
            avatar="🔔"
            description="您有新的系统更新"
            extra={
              <View style={styles.timeContainer}>
                <Text style={[styles.timeText, { color: token.colorTextSecondary }]}>2天前</Text>
                <View style={[styles.badge, { backgroundColor: token.colorError }]}>
                  <Text style={[styles.badgeText, { color: token.colorText }]}>!</Text>
                </View>
              </View>
            }
            onPress={() => handlePress('系统通知')}
            title="系统通知"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: token.colorText }]}>使用技巧</Text>
        <View style={[styles.tips, { backgroundColor: token.colorBgElevated }]}>
          <View style={styles.tipItem}>
            <Text style={[styles.tipTitle, { color: token.colorText }]}>📝 基础用法</Text>
            <Text style={[styles.tipDesc, { color: token.colorTextSecondary }]}>
              只需要提供title和avatar即可创建最简单的列表项
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={[styles.tipTitle, { color: token.colorText }]}>📄 添加描述</Text>
            <Text style={[styles.tipDesc, { color: token.colorTextSecondary }]}>
              使用description属性添加副标题或详细说明
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={[styles.tipTitle, { color: token.colorText }]}>⚡ 额外内容</Text>
            <Text style={[styles.tipDesc, { color: token.colorTextSecondary }]}>
              extra属性可以显示时间、状态、计数等任意React组件
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={[styles.tipTitle, { color: token.colorText }]}>🎯 交互响应</Text>
            <Text style={[styles.tipDesc, { color: token.colorTextSecondary }]}>
              使用onPress处理点击事件，提供良好的用户反馈
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
