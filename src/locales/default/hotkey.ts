import { HotkeyI18nTranslations } from '@/types/hotkey';

const hotkey: HotkeyI18nTranslations = {
  addUserMessage: {
    desc: '将当前输入内容添加为用户消息，但不触发生成',
    title: '添加一条用户消息',
  },
  editMessage: {
    desc: '通过按住 Alt 并双击消息进入编辑模式',
    title: '编辑消息',
  },
  openChatSettings: {
    title: '打开会话设置',
  },
  regenerateMessage: {
    desc: '重新生成最后一条消息',
    title: '重新生成消息',
  },
  saveTopic: {
    desc: '保存当前话题并打开新话题',
    title: '开启新话题',
  },
  search: {
    title: '搜索',
  },
  switchAgent: {
    desc: '通过按住 Ctrl 加数字 0~9 切换固定在侧边栏的助手',
    title: '快捷切换助手',
  },
  toggleLeftPanel: {
    title: '显示/隐藏助手面板',
  },
  toggleRightPanel: {
    title: '显示/隐藏话题面板',
  },
  toggleZenMode: {
    title: '切换专注模式',
  },
};

export default hotkey;
