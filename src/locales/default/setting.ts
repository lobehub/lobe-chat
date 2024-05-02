export default {
  about: {
    title: '关于',
  },
  analytics: {
    telemetry: {
      desc: '通过选择发送遥测数据，你可以帮助我们改善 LobeChat 整体用户体验',
      title: '发送匿名使用数据',
    },
    title: '数据统计',
  },
  danger: {
    clear: {
      action: '立即清除',
      confirm: '确认清除所有聊天数据？',
      desc: '将会清除所有会话数据，包括助手、文件、消息、插件等',
      success: '已清除所有会话消息',
      title: '清除所有会话消息',
    },
    reset: {
      action: '立即重置',
      confirm: '确认重置所有设置？',
      currentVersion: '当前版本',
      desc: '重置所有设置，使用默认值',
      success: '已重置所有设置',
      title: '重置所有设置',
    },
  },
  header: {
    desc: '偏好与模型设置',
    global: '全局设置',
    session: '会话设置',
    sessionDesc: '角色设定与会话偏好',
    sessionWithName: '会话设置 · {{name}}',
    title: '设置',
  },
  llm: {
    checker: {
      button: '检查',
      desc: '测试 Api Key 与代理地址是否正确填写',
      ollamaDesc: '测试代理地址是否正确填写',
      pass: '检查通过',
      title: '连通性检查',
    },
    customModelCards: {
      addNew: '创建并添加 {{id}} 模型',
      config: '配置模型',
      confirmDelete: '即将删除该自定义模型，删除后将不可恢复，请谨慎操作。',
      modelConfig: {
        azureDeployName: {
          extra: '在 Azure OpenAI 中实际请求的字段',
          placeholder: '请输入 Azure 中的模型部署名称',
          title: '模型部署名称',
        },
        displayName: {
          placeholder: '请输入模型的展示名称，例如 ChatGPT、GPT-4 等',
          title: '模型展示名称',
        },
        files: {
          extra:
            '当前 LobeChat 的文件上传实现仅为一种 Hack 方案，仅限自行尝试。完整文件上传能力请等待后续实现',
          title: '支持文件上传',
        },
        functionCall: {
          extra:
            '此配置将仅开启 LobeChat 中的函数调用能力，是否支持函数调用完全取决于模型本身，请自行测试该模型的函数调用能力可用性',
          title: '支持函数调用',
        },
        id: {
          extra: '将作为模型标签进行展示',
          placeholder: '请输入模型id，例如 gpt-4-turbo-preview 或 claude-2.1',
          title: '模型 ID',
        },
        modalTitle: '自定义模型配置',
        tokens: {
          title: '最大 token 数',
          unlimited: '无限制',
        },
        vision: {
          extra:
            '此配置将仅开启 LobeChat 中的图片上传配置，是否支持识别完全取决于模型本身，请自行测试该模型的视觉识别能力可用性',
          title: '支持视觉识别',
        },
      },
    },
    fetchOnClient: {
      desc: '客户端请求模式将从浏览器直接发起会话请求，可提升响应速度',
      title: '使用客户端请求模式',
    },
    fetcher: {
      fetch: '获取模型列表',
      fetching: '正在获取模型列表...',
      latestTime: '上次更新时间：{{time}}',
      noLatestTime: '暂未获取列表',
    },
    modelList: {
      desc: '选择在会话中展示的模型，选择的模型会在模型列表中展示',
      placeholder: '请从列表中选择模型',
      title: '模型列表',
      total: '共 {{count}} 个模型可用',
    },
    waitingForMore: '更多模型正在 <1>计划接入</1> 中，敬请期待 ✨',
  },
  ollama: {
    download: {
      desc: 'Ollama 正在下载该模型，请尽量不要关闭本页面。重新下载时将会中断处继续',
      remainingTime: '剩余时间',
      speed: '下载速度',
      title: '正在下载模型 {{model}} ',
    },
  },
  plugin: {
    addTooltip: '自定义插件',
    clearDeprecated: '移除无效插件',
    empty: '暂无已安装插件，欢迎前往 <1>插件商店</1> 探索',
    installStatus: {
      deprecated: '已卸载',
    },
    settings: {
      hint: '请根据描述填写以下配置',
      title: '{{id}} 插件配置',
      tooltip: '插件配置',
    },
    store: '插件商店',
  },
  settingAgent: {
    avatar: {
      title: '头像',
    },
    backgroundColor: {
      title: '背景色',
    },
    description: {
      placeholder: '请输入助手描述',
      title: '助手描述',
    },
    name: {
      placeholder: '请输入助手名称',
      title: '名称',
    },
    prompt: {
      placeholder: '请输入角色 Prompt 提示词',
      title: '角色设定',
    },
    tag: {
      placeholder: '请输入标签',
      title: '标签',
    },
    title: '助手信息',
  },
  settingChat: {
    autoCreateTopicThreshold: {
      desc: '当前消息数超过设定该值后，将自动创建话题',
      title: '消息阈值',
    },
    chatStyleType: {
      title: '聊天窗口样式',
      type: {
        chat: '对话模式',
        docs: '文档模式',
      },
    },
    compressThreshold: {
      desc: '当未压缩的历史消息超过该值时，将进行压缩',
      title: '历史消息长度压缩阈值',
    },
    enableAutoCreateTopic: {
      desc: '会话过程中是否自动创建话题，仅在临时话题中生效',
      title: '自动创建话题',
    },
    enableCompressThreshold: {
      title: '是否开启历史消息长度压缩阈值',
    },
    enableHistoryCount: {
      alias: '不限制',
      limited: '只包含 {{number}} 条会话消息',
      title: '限制历史消息数',
      unlimited: '不限历史消息数',
    },
    historyCount: {
      desc: '每次请求携带的消息数（包括最新编写的提问。每个提问和回答都计算1）',
      title: '附带消息数',
    },
    inputTemplate: {
      desc: '用户最新的一条消息会填充到此模板',
      placeholder: '预处理模版 {{text}} 将替换为实时输入信息',
      title: '用户输入预处理',
    },
    title: '聊天设置',
  },
  settingModel: {
    enableMaxTokens: {
      title: '开启单次回复限制',
    },
    frequencyPenalty: {
      desc: '值越大，越有可能降低重复字词',
      title: '频率惩罚度',
    },
    maxTokens: {
      desc: '单次交互所用的最大 Token 数',
      title: '单次回复限制',
    },
    model: {
      desc: 'ChatGPT 模型',
      list: {
        'gpt-3.5-turbo': 'GPT 3.5',
        'gpt-3.5-turbo-16k': 'GPT 3.5 (16K)',
        'gpt-4': 'GPT 4',
        'gpt-4-32k': 'GPT 4 (32K)',
      },
      title: '模型',
    },
    presencePenalty: {
      desc: '值越大，越有可能扩展到新话题',
      title: '话题新鲜度',
    },
    temperature: {
      desc: '值越大，回复越随机',
      title: '随机性',
      titleWithValue: '随机性 {{value}}',
    },
    title: '模型设置',
    topP: {
      desc: '与随机性类似，但不要和随机性一起更改',
      title: '核采样',
    },
  },
  settingPlugin: {
    title: '插件列表',
  },
  settingSystem: {
    accessCode: {
      desc: '管理员已开启加密访问',
      placeholder: '请输入访问密码',
      title: '访问密码',
    },
    oauth: {
      info: {
        desc: '已登录',
        title: '账户信息',
      },
      signin: {
        action: '登录',
        desc: '使用 SSO 登录以解锁应用',
        title: '登录账号',
      },
      signout: {
        action: '退出登录',
        confirm: '确认退出？',
        success: '退出登录成功',
      },
    },
    title: '系统设置',
  },
  settingTTS: {
    openai: {
      sttModel: 'OpenAI 语音识别模型',
      title: 'OpenAI',
      ttsModel: 'OpenAI 语音合成模型',
    },
    showAllLocaleVoice: {
      desc: '关闭则只显示当前语种的声源',
      title: '显示所有语种声源',
    },
    stt: '语音识别设置',
    sttAutoStop: {
      desc: '关闭后，语音识别将不会自动结束，需要手动点击结束按钮',
      title: '自动结束语音识别',
    },
    sttLocale: {
      desc: '语音输入的语种，此选项可提高语音识别准确率',
      title: '语音识别语种',
    },
    sttService: {
      desc: '其中 broswer 为浏览器原生的语音识别服务',
      title: '语音识别服务',
    },
    title: '语音服务',
    tts: '语音合成设置',
    ttsService: {
      desc: '如使用 OpenAI 语音合成服务，需要保证 OpenAI 模型服务已开启',
      title: '语音合成服务',
    },
    voice: {
      desc: '为当前助手挑选一个声音，不同 TTS 服务支持的声源不同',
      preview: '试听声源',
      title: '语音合成声源',
    },
  },
  settingTheme: {
    avatar: {
      title: '头像',
    },
    fontSize: {
      desc: '聊天内容的字体大小',
      marks: {
        normal: '标准',
      },
      title: '字体大小',
    },
    lang: {
      autoMode: '跟随系统',
      title: '语言',
    },
    neutralColor: {
      desc: '不同色彩倾向的灰阶自定义',
      title: '中性色',
    },
    primaryColor: {
      desc: '自定义主题色',
      title: '主题色',
    },
    themeMode: {
      auto: '自动',
      dark: '深色',
      light: '浅色',
      title: '主题',
    },
    title: '主题设置',
  },
  submitAgentModal: {
    button: '提交助手',
    identifier: 'identifier 助手标识符',
    metaMiss: '请补全助手信息后提交，需要包含名称、描述和标签',
    placeholder: '请输入助手的标识符，需要是唯一的，比如 web-development',
    tooltips: '分享到助手市场',
  },
  sync: {
    device: {
      deviceName: {
        hint: '添加名称以便于识别',
        placeholder: '请输入设备名称',
        title: '设备名称',
      },
      title: '设备信息',
      unknownBrowser: '未知浏览器',
      unknownOS: '未知系统',
    },
    warning: {
      message: '本功能目前仍为实验性功能，可能存在预期外或不稳定的情况，如遇到问题请及时提交反馈。',
    },
    webrtc: {
      channelName: {
        desc: 'WebRTC 将使用此名创建同步频道，确保频道名称唯一',
        placeholder: '请输入同步频道名称',
        shuffle: '随机生成',
        title: '同步频道名称',
      },
      channelPassword: {
        desc: '添加密码确保频道私密性，只有密码正确时，设备才可加入频道',
        placeholder: '请输入同步频道密码',
        title: '同步频道密码',
      },
      desc: '实时、点对点的数据通信，需设备同时在线才可同步',
      enabled: {
        invalid: '请填写同步频道名称后再开启',
        // desc: 'WebRTC 将使用此名创建同步频道，确保频道名称唯一',
        title: '开启同步',
      },
      title: 'WebRTC 同步',
    },
  },
  tab: {
    about: '关于',
    agent: '默认助手',
    common: '通用设置',
    experiment: '实验',
    llm: '语言模型',
    sync: '云端同步',
    tts: '语音服务',
  },
  tools: {
    builtins: {
      groupName: '内置插件',
    },
    disabled: '当前模型不支持函数调用，无法使用插件',
    plugins: {
      enabled: '已启用 {{num}}',
      groupName: '三方插件',
      noEnabled: '暂无启用插件',
      store: '插件商店',
    },
    title: '扩展插件',
  },
};
