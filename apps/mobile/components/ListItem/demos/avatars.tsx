import { Download, Heart, Home, Search, Share } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ListItem from '../index';

const handlePress = (title: string) => {
  console.log(`点击了: ${title}`);
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  content: {
    padding: 16,
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

export default function AvatarsDemo() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Emoji 头像</Text>
        <Text style={styles.sectionDesc}>使用emoji作为头像，简单直观且支持所有平台</Text>
        <View style={styles.section}>
          <ListItem
            avatar="👤"
            description="个人信息管理"
            onPress={() => handlePress('用户资料')}
            title="用户资料"
          />

          <ListItem
            avatar="⚙️"
            description="应用程序配置"
            onPress={() => handlePress('设置中心')}
            title="设置中心"
          />

          <ListItem
            avatar="🔔"
            description="推送通知设置"
            onPress={() => handlePress('消息通知')}
            title="消息通知"
          />

          <ListItem
            avatar="🔒"
            description="隐私保护设置"
            onPress={() => handlePress('安全隐私')}
            title="安全隐私"
          />

          <ListItem
            avatar="❓"
            description="常见问题与帮助"
            onPress={() => handlePress('帮助支持')}
            title="帮助支持"
          />
        </View>

        <Text style={styles.sectionTitle}>人物 Emoji</Text>
        <Text style={styles.sectionDesc}>适合用户列表、联系人等场景</Text>
        <View style={styles.section}>
          <ListItem
            avatar="👩‍💼"
            description="产品经理 • 在线"
            extra="PM"
            onPress={() => handlePress('Alice Johnson')}
            title="Alice Johnson"
          />

          <ListItem
            avatar="👨‍💻"
            description="前端开发工程师 • 忙碌"
            extra="FE"
            onPress={() => handlePress('Bob Smith')}
            title="Bob Smith"
          />

          <ListItem
            avatar="👩‍🎨"
            description="UI/UX 设计师 • 离线"
            extra="UI"
            onPress={() => handlePress('Carol Wilson')}
            title="Carol Wilson"
          />

          <ListItem
            avatar="👨‍🔬"
            description="数据分析师 • 在线"
            extra="DA"
            onPress={() => handlePress('David Brown')}
            title="David Brown"
          />
        </View>

        <Text style={styles.sectionTitle}>图标组件头像</Text>
        <Text style={styles.sectionDesc}>使用React组件作为头像，提供更丰富的视觉效果</Text>
        <View style={styles.section}>
          <ListItem
            avatar={<Home color="#007AFF" size={24} />}
            description="返回主页面"
            onPress={() => handlePress('首页')}
            title="首页"
          />

          <ListItem
            avatar={<Search color="#34C759" size={24} />}
            description="搜索内容或功能"
            onPress={() => handlePress('搜索')}
            title="搜索"
          />

          <ListItem
            avatar={<Heart color="#FF3B30" size={24} />}
            description="我的收藏内容"
            onPress={() => handlePress('收藏夹')}
            title="收藏夹"
          />

          <ListItem
            avatar={<Download color="#FF9500" size={24} />}
            description="离线下载管理"
            onPress={() => handlePress('下载')}
            title="下载"
          />

          <ListItem
            avatar={<Share color="#5856D6" size={24} />}
            description="分享给朋友"
            onPress={() => handlePress('分享')}
            title="分享"
          />
        </View>

        <Text style={styles.sectionTitle}>网络图片头像</Text>
        <Text style={styles.sectionDesc}>使用网络图片作为头像，适合用户头像等场景</Text>
        <View style={styles.section}>
          <ListItem
            avatar="https://picsum.photos/80/80?random=1"
            description="这是一个示例用户"
            extra="VIP"
            onPress={() => handlePress('示例用户 1')}
            title="示例用户 1"
          />

          <ListItem
            avatar="https://picsum.photos/80/80?random=2"
            description="另一个示例用户"
            extra="PRO"
            onPress={() => handlePress('示例用户 2')}
            title="示例用户 2"
          />

          <ListItem
            avatar="https://picsum.photos/80/80?random=3"
            description="第三个示例用户"
            onPress={() => handlePress('示例用户 3')}
            title="示例用户 3"
          />
        </View>

        <Text style={styles.sectionTitle}>组合使用技巧</Text>
        <View style={styles.tips}>
          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>🎯 选择合适的头像类型</Text>
            <Text style={styles.tipDesc}>
              • Emoji: 简单通用，适合功能入口{'\n'}• 图标组件: 精美专业，适合导航菜单{'\n'}•
              网络图片: 个性化强，适合用户列表
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>📐 尺寸一致性</Text>
            <Text style={styles.tipDesc}>确保同一列表中的头像尺寸保持一致，避免视觉错乱</Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>🎨 色彩搭配</Text>
            <Text style={styles.tipDesc}>图标颜色应与应用主题协调，建议使用系统色彩或品牌色</Text>
          </View>

          <View style={styles.tipItem}>
            <Text style={styles.tipTitle}>⚡ 性能考虑</Text>
            <Text style={styles.tipDesc}>大量网络图片时建议使用图片缓存，避免重复加载</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
