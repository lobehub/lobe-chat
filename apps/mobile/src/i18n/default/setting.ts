export default {
  about: '关于 LobeHub',
  account: {
    group: '账户',
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
    switchAccount: {
      action: '切换账号',
      confirm: '确定要切换账号吗？这会退出当前账户并重新登录。',
      error: '切换账号失败，请重试。',
      label: '切换账号',
    },
    title: '账号设置',
  },

  advanced: {
    group: '高级',
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
      emptySearch: '未找到匹配的服务商',
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
  cache: {
    clear: {
      confirm: {
        action: '清理缓存',
        description: '这将移除保存在本地的缓存数据，下一次打开应用时需要重新加载内容。',
        title: '确认清理缓存？',
      },
      failure: '清理缓存失败',
      success: '缓存已清理',
    },
    description: '缓存可以提升启动速度，需要释放空间时可以点击清理。',
    title: '清理缓存',
  },
  changelog: '更新日志',
  color: {
    neutral: {
      description: '选择应用的中性色调',
      title: '中性色配置',
    },
    preview: '预览',
    previewMessages: {
      botGreat: '很高兴你喜欢！这个预览功能让你可以在应用设置之前直观地看到主题效果。',
      botHowToUse: '你可以通过下面的颜色选择器来调整主色和中性色，预览会实时更新以显示效果。',
      userGreat: '很棒！',
      userHowToUse: '主题预览如何使用？',
    },
    primary: {
      description: '选择应用的主色调',
      title: '主色配置',
    },
    title: '色彩设置',
  },
  developer: {
    auth: {
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
      error: {
        noToken: '当前无可用 Token',
      },
      group: '认证配置',
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
    },

    failurePrefix: '操作失败: ',
    mode: {
      already: '你已经处于开发者模式',
      enabled: '开发者模式已开启',
      remaining: '再点按 {{count}} 次即可开启开发者模式',
      title: '开发者模式',
    },

    selfHostedEntry: {
      confirmAction: '前往配置页',
      confirmDescription: '启用后将直接打开自托管配置页面，是否退出当前账号并前往配置页？',
      confirmResetAction: '重置并前往登录',
      confirmResetDescription:
        '关闭自部署模式将重置服务器地址为官方实例，并退出当前账号。是否继续？',
      confirmResetTitle: '关闭自部署模式',
      confirmTitle: '启用自托管登录入口',
      description: '控制登录页是否展示自托管实例按钮',
      title: '开启自部署模式',
    },
    server: {
      confirmDescription: '修改服务器地址后将会退出当前用户并需要重新登录，是否继续？',
      confirmTitle: '确认切换服务器',
      current: '当前地址',
      description: '配置后，所有请求都会使用该服务器地址。留空则恢复到官方服务器。',
      group: '服务器配置',
      hint: '必须以 http:// 或 https:// 开头，应用可能需要重新登录。',
      invalid: '请输入以 http:// 或 https:// 开头的有效地址',
      notice:
        '自定义服务器会替换默认接口地址，请确保服务可用并兼容 LobeChat API 协议。切换后可能需要重新登录或重启应用',
      noticeTitle: '切换前请注意',
      placeholder: 'https://your-server.example.com',
      reset: '恢复默认',
      resetSuccess: '已恢复官方服务器地址',
      save: '保存',
      title: '自部署实例',
      updated: '自定义服务器地址已更新',
    },
    title: '开发者选项',
  },
  feedback: {
    email: {
      body: {
        description: '问题描述：',
        footer: '发自我的 {{device}}',
        frequency: '出现频率：',
        screenshots: '相关截图：',
        template: '请详细描述您遇到的问题，以便我们更好地协助您解决。',
      },
      subject: '反馈 - LobeChat - {{version}}',
    },
    error: '打开邮件客户端失败，请稍后重试',
    saved: '反馈已保存到草稿箱',
    sent: '邮件已发送，感谢您的反馈！',
    title: '意见反馈',
    unavailable: '邮件功能不可用，请检查设备是否配置了邮箱账户或邮件功能',
  },
  fontSize: {
    preview: {
      botAnswer:
        '**如何调整字体大小？**\n\n使用下方的滑块即可调节字体大小：向左变小，向右变大。拖动时，这里会实时预览效果。\n\n小提示：选择"标准"刻度可快速恢复默认大小。',
      botGreat: '很高兴你喜欢！这个预览功能让你可以在应用设置之前直观地看到在对话框中的对话效果。',
      userGreat: '很棒！',
      userQuestion: '我想把对话字体调大一些，该怎么做？',
    },
    standard: '标准',
    text: '注意，该配置仅影响消息内容的字体大小展示',
    title: '字体大小',
  },
  general: {
    group: '通用',
  },
  help: '使用帮助',
  info: {
    group: '信息',
  },
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
  providersDetail: {
    tabs: {
      configuration: '配置',
      models: '模型',
    },
  },
  providersSearchPlaceholder: '以关键词搜索供应商...',
  support: '邮件支持',
  themeMode: {
    auto: '跟随系统',
    dark: '深色模式',
    light: '浅色模式',
    title: '主题模式',
  },
  title: '设置',
  update: {
    check: {
      applyAction: '立即重启',
      applyDescription: '需要重启应用以应用最新更新，是否现在重启？',
      applyError: '应用更新失败，请稍后重试',
      applyTitle: '应用更新',
      applying: '正在重启以应用更新...',
      checking: '正在检查更新...',
      downloaded: '更新包已下载完成',
      downloading: '检测到新版本，正在下载更新...',
      error: '检查更新失败，请稍后重试',
      none: '当前已是最新版本',
      title: '检查更新',
      unavailable: '当前构建不支持检查更新，请在正式版本中使用此功能。',
    },
  },
  version: '当前版本',
};
