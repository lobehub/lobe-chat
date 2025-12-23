export default {
  consent: {
    buttons: {
      accept: '授权',
      deny: '拒绝',
    },
    description: '应用 {{clientName}} 申请你的账户授权',

    error: {
      sessionInvalid: {
        message: '授权会话已过期或无效。请返回并重新发起授权流程',
        title: '授权会话无效',
      },
      title: '发生错误',
      unsupportedInteraction: {
        message: '不支持的交互类型：{promptName}',
        title: '不支持的交互类型',
      },
    },
    permissionsTitle: '请求以下权限：',
    redirectUri: '授权成功后将重定向到',
    redirecting: '授权成功，跳转中…',
    scope: {
      'email': '访问你的电子邮件地址',
      'offline_access': '允许客户端访问你的数据',
      'openid': '使用你的 LobeHub 账户进行身份验证',
      'profile': '访问你的基本资料信息（名称、头像等）',
      'sync-read': '读取你的同步数据',
      'sync-write': '写入并更新你的同步数据',
    },
    title: '授权 {{clientName}}',
  },
  error: {
    backToHome: '返回首页',
    desc: 'OAuth 授权未完成：{{reason}}。你可以返回首页后重试',
    reason: {
      internal_error: '服务端错误',
      invalid_request: '无效的请求参数',
    },
    title: '授权遇到了问题',
  },
  handoff: {
    desc: {
      processing: '正在处理授权，即将跳转到下一步…',
      success: '已尝试打开桌面端。若未自动打开，请手动切换到桌面端；之后可关闭此窗口',
    },
    title: {
      processing: '授权处理中…',
      success: '授权已完成',
    },
  },
  login: {
    button: '确认登录',
    description: '应用 {{clientName}} 申请使用你的账户进行登录',
    title: '登录 {{clientName}}',
    userWelcome: '欢迎回来，',
  },
  success: {
    subTitle: '应用已获得授权。你可以关闭此页面了',
    title: '授权完成',
  },
};
