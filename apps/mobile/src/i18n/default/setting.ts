export default {
  about: '关于 LobeHub',
  account: {
    profile: {
      email: '邮箱',
      name: '用户名',
      status: '账号状态',
      unverified: '未验证',
      verified: '已验证',
    },
    signOut: {
      confirm: '您确定要退出登录吗？',
      label: '退出登录',
    },
    title: '账号设置',
  },
  aiProviders: {
    configuration: {
      apiKey: {
        description: '请输入 {{name}} 的 API Key',
        label: 'API Key',
        placeholder: '请输入 {{name}} 的 API Key',
      },
      proxyUrl: {
        desc: '必须包含 http(s)://',
        invalid: '请输入以 http:// 或 https:// 开头的有效 URL',
        placeholder: 'https://api.example.com/v1',
        title: 'API 代理地址',
      },
      saving: '正在保存配置...',
      title: '配置',
      updateFailedDesc: '保存失败，请重试',
      updateFailedTitle: '保存失败',
    },
    detail: {
      loadFailed: '加载服务商配置失败',
      loading: '正在加载服务商配置...',
    },
    info: {
      builtIn: '内置服务商',
      custom: '自定义服务商',
    },
    list: {
      disabled: '未启用',
      enabled: '已启用',
      loadFailed: '服务商列表加载失败',
    },
    models: {
      allLoaded: '已显示全部模型',
      copySuccess: '复制成功',
      disableFailed: '禁用模型失败',
      emptyNoSearch: '没有找到任何模型，尝试从服务器获取',
      emptyWithSearch: '没有符合搜索条件的模型',
      enableFailed: '启用模型失败',
      fetch: '获取模型',
      fetchFailed: '获取模型失败，请重试',
      fetchSuccess: '模型列表获取成功！',
      fetching: '正在获取...',
      loading: '正在加载...',
      loadingMore: '正在加载更多...',
      modelsAvailable: '共 {{count}} 个可用模型',
      searchPlaceholder: '搜索模型...',
      title: '模型',
    },
    skeleton: {
      disabled: '未启用',
      enabled: '已启用',
    },
  },
  changelog: '更新日志',
  color: {
    neutral: {
      description: '选择应用的中性色调',
      title: '中性色配置',
    },
    preview: '预览',
    previewMessages: {
      botHowToUse: '你可以通过下面的颜色选择器来调整主色和中性色，预览会实时更新以显示效果。',
      userHowToUse: '主题预览如何使用？',
    },
    primary: {
      description: '选择应用的主色调',
      title: '主色配置',
    },
    title: '色彩设置',
  },
  developer: {
    accessToken: {
      expire: {
        success: '已使访问令牌立即过期',
        title: '访问令牌过期',
      },
      invalidate: {
        success: '已写入无效的访问令牌',
        title: '无效访问令牌',
      },
    },
    clearAuthData: {
      success: '已清空认证数据',
      title: '清空认证数据',
    },
    failurePrefix: '操作失败: ',
    refreshToken: {
      expire: {
        success: '已使刷新令牌立即过期',
        title: '刷新令牌过期',
      },
      invalidate: {
        success: '已写入无效的刷新令牌',
        title: '无效刷新令牌',
      },
    },
    title: '开发者选项',
  },
  feedback: '意见反馈',
  fontSize: {
    standard: '标准',
    title: '字体大小',
  },
  help: '使用帮助',
  locale: {
    auto: {
      description: '跟随系统语言设置',
      title: '跟随系统',
    },
    title: '语言设置',
  },
  openai: 'OpenAI 设置',
  openaiSettings: {
    apiKey: 'API Key',
    apiKeyPlaceholder: '请输入你的 OpenAI API Key',
    checkApiKey: '请检查 API Key 是否正确',
    checkProxyAddress: '无法连接到服务器，请检查代理地址是否正确',
    connectionSuccess: '连接成功，API Key 和代理地址配置正确',
    connectivityHint: '测试连通性后，将会验证 API Key 与代理地址是否正确填写',
    pleaseEnterApiKey: '请输入 API Key',
    proxyAddress: 'API 代理地址',
    proxyPlaceholder: '必须包含 http(s)://',
    testConnectivity: '测试连通性',
    validationFailed: '验证失败',
    validationSuccess: '验证成功',
  },

  providerModels: {
    config: {
      aesGcm: '您的秘钥与代理地址等将使用 <1>AES-GCM</1> 算法进行加密',
      checker: {
        button: '测试连接',
        desc: '测试 Api Key 与代理地址是否正确填写',
        pass: '检查通过',
        selectModel: '选择用于测试连接的模型',
        title: '连通性检查',
      },
    },
  },

  providers: 'AI 服务商',
  support: '邮件支持',
  themeMode: {
    auto: '跟随系统',
    dark: '深色模式',
    light: '浅色模式',
    title: '主题模式',
  },
  title: '设置',
  version: '当前版本',
};
