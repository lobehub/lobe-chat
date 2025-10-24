import { ListItem, Text } from '@lobehub/ui-rn';
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  CreditCard,
  Headphones,
  QrCode,
  RefreshCw,
  Share2,
  Trash2,
} from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

const handleActionPress = (action: string) => {
  Alert.alert('操作确认', `确定要执行 "${action}" 操作吗？`, [
    { onPress: () => console.log(`执行了: ${action}`), text: '确定' },
    { style: 'cancel', text: '取消' },
  ]);
};

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingInline: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  noNotification: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '500',
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
  selectionContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  selectionText: {
    color: '#8E8E93',
    fontSize: 12,
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
});

export default function NavigationDemo() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [notificationCount, setNotificationCount] = useState(5);

  const handlePress = (title: string) => {
    setSelectedItem(title);
    console.log(`点击了: ${title}`);
  };

  const handleNotificationPress = () => {
    Alert.alert('通知中心', `您有 ${notificationCount} 条未读通知`, [
      { onPress: () => setNotificationCount(0), text: '全部已读' },
      { style: 'cancel', text: '取消' },
    ]);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>路由导航</Text>
        <Text style={styles.sectionDesc}>使用href属性进行页面导航，与Expo Router集成</Text>
        <View style={styles.section}>
          <ListItem avatar="👤" description="查看和编辑个人信息" extra=">" title="用户资料" />
          <ListItem avatar="⚙️" description="应用程序配置选项" extra=">" title="设置中心" />
          <ListItem avatar="ℹ️" description="版本信息和帮助文档" extra=">" title="关于应用" />
          <ListItem avatar="💬" description="提交意见和建议" extra=">" title="反馈建议" />
        </View>

        <Text style={styles.sectionTitle}>交互响应</Text>
        <Text style={styles.sectionDesc}>使用onPress处理点击事件，提供交互反馈</Text>
        <View style={styles.section}>
          <ListItem
            avatar="🔔"
            description="查看所有通知消息"
            extra={
              notificationCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              ) : (
                <Text style={styles.noNotification}>全部已读</Text>
              )
            }
            onPress={handleNotificationPress}
            title="通知中心"
          />

          <ListItem
            avatar="🗑️"
            description="清理应用缓存数据"
            extra="123MB"
            onPress={() => handleActionPress('清除缓存')}
            title="清除缓存"
          />

          <ListItem
            avatar="🚪"
            description="安全退出当前账户"
            onPress={() => handleActionPress('退出登录')}
            title="退出登录"
          />
        </View>

        <Text style={styles.sectionTitle}>选中状态</Text>
        <Text style={styles.sectionDesc}>展示列表项的选中状态效果</Text>
        <View style={styles.section}>
          <ListItem
            avatar="🎨"
            description="选择您喜欢的界面主题"
            extra={
              <View style={styles.selectionContainer}>
                <Text style={styles.selectionText}>
                  {selectedItem === '主题设置' ? '已选中' : '未选中'}
                </Text>
                {selectedItem === '主题设置' ? (
                  <CheckCircle2 color="#34C759" size={20} />
                ) : (
                  <Circle color="#8E8E93" size={20} />
                )}
              </View>
            }
            onPress={() => handlePress('主题设置')}
            title="主题设置"
          />

          <ListItem
            avatar="🌍"
            description="选择应用显示语言"
            extra={
              <View style={styles.selectionContainer}>
                <Text style={styles.selectionText}>
                  {selectedItem === '语言设置' ? '已选中' : '未选中'}
                </Text>
                {selectedItem === '语言设置' ? (
                  <CheckCircle2 color="#34C759" size={20} />
                ) : (
                  <Circle color="#8E8E93" size={20} />
                )}
              </View>
            }
            onPress={() => handlePress('语言设置')}
            title="语言设置"
          />

          <ListItem
            avatar="🔕"
            description="管理推送通知偏好"
            extra={
              <View style={styles.selectionContainer}>
                <Text style={styles.selectionText}>
                  {selectedItem === '通知设置' ? '已选中' : '未选中'}
                </Text>
                {selectedItem === '通知设置' ? (
                  <CheckCircle2 color="#34C759" size={20} />
                ) : (
                  <Circle color="#8E8E93" size={20} />
                )}
              </View>
            }
            onPress={() => handlePress('通知设置')}
            title="通知设置"
          />
        </View>

        <Text style={styles.sectionTitle}>功能菜单</Text>
        <Text style={styles.sectionDesc}>常见的功能菜单示例</Text>
        <View style={styles.section}>
          <ListItem
            avatar={<QrCode color="#007AFF" size={24} />}
            description="扫描二维码或条形码"
            onPress={() => handlePress('扫一扫')}
            title="扫一扫"
          />

          <ListItem
            avatar={<CreditCard color="#34C759" size={24} />}
            description="快速收款和付款"
            onPress={() => handlePress('收付款')}
            title="收付款"
          />

          <ListItem
            avatar={<Share2 color="#FF9500" size={24} />}
            description="设备间文件传输"
            onPress={() => handlePress('传输文件')}
            title="传输文件"
          />

          <ListItem
            avatar={<Headphones color="#5856D6" size={24} />}
            description="在线客服支持"
            onPress={() => handlePress('联系客服')}
            title="联系客服"
          />
        </View>

        <Text style={styles.sectionTitle}>危险操作</Text>
        <Text style={styles.sectionDesc}>需要特别注意的危险操作项</Text>
        <View style={styles.section}>
          <ListItem
            avatar={<Trash2 color="#FF3B30" size={24} />}
            description="永久删除您的账户"
            extra={<AlertTriangle color="#FF9500" size={20} />}
            onPress={() => {
              Alert.alert('危险操作', '删除账户将无法恢复，确定要继续吗？', [
                { style: 'cancel', text: '取消' },
                {
                  onPress: () => console.log('账户已删除'),
                  style: 'destructive',
                  text: '删除',
                },
              ]);
            }}
            title="删除账户"
          />

          <ListItem
            avatar={<RefreshCw color="#FF9500" size={24} />}
            description="恢复到出厂设置状态"
            extra={<AlertTriangle color="#FF9500" size={20} />}
            onPress={() => {
              Alert.alert('重置确认', '这将清除所有数据和设置，确定要继续吗？', [
                { style: 'cancel', text: '取消' },
                {
                  onPress: () => console.log('应用已重置'),
                  style: 'destructive',
                  text: '重置',
                },
              ]);
            }}
            title="重置应用"
          />
        </View>

        <Text style={styles.sectionTitle}>交互技巧</Text>
        <View style={styles.tips}>
          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>🔗 路由导航</Text>
            <Text style={styles.tipDesc}>使用href属性可以直接跳转到指定页面，无需手动处理导航</Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>🎯 点击回调</Text>
            <Text style={styles.tipDesc}>onPress函数在用户点击时触发，可以执行任意逻辑操作</Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>⚠️ 危险操作</Text>
            <Text style={styles.tipDesc}>对于删除、重置等危险操作，建议使用Alert进行二次确认</Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>📱 用户反馈</Text>
            <Text style={styles.tipDesc}>及时的视觉反馈和状态更新能提升用户体验</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
