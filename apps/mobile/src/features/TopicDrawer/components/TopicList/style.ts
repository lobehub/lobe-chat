import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  // 激活的默认话题容器
  activeDefaultTopic: {
    backgroundColor: token.colorPrimaryBg,
    borderColor: token.colorPrimary,
  },

  // 激活的默认话题标题
  activeDefaultTopicTitle: {
    color: token.colorText,
  },

  // 主容器
  container: {
    flex: 1,
  },

  // 默认话题容器
  defaultTopicContainer: {
    alignItems: 'center',
    borderColor: token.colorBorder,
    borderRadius: 8,
    borderStyle: 'dashed',
    borderWidth: 1,
    flexDirection: 'row',
    marginHorizontal: 12,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  // 默认话题内容容器
  defaultTopicContent: {
    flex: 1,
  },

  // 默认话题图标容器
  defaultTopicIcon: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    marginRight: 8,
    width: 20,
  },

  // 默认话题标题
  defaultTopicTitle: {
    color: token.colorText,
    flex: 1,
    fontSize: 14,
  },

  // 空状态容器
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  // 空状态文本
  emptyText: {
    color: token.colorTextTertiary,
    fontSize: 14,
    textAlign: 'center',
  },

  // 头部
  header: {
    borderBottomColor: token.colorBorderSecondary,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  // 滚动内容容器
  scrollContent: {
    paddingBottom: 20,
  },

  // 滚动视图
  scrollView: {
    flex: 1,
  },

  // 临时标签
  tempBadge: {
    backgroundColor: token.colorFillTertiary,
    borderRadius: 4,
    color: token.colorTextSecondary,
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  // 临时标签容器
  tempBadgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 标题
  title: {
    color: token.colorText,
    fontSize: 16,
    fontWeight: '600',
  },

  // Topic项（临时样式）
  topicItem: {
    borderBottomColor: token.colorBorderSecondary,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
}));
