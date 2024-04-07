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
      desc: '重置所有设置项回默认值',
      title: '重置所有设置',
    },
  },
  header: {
    global: '全局设置',
    session: '会话设置',
    sessionWithName: '会话设置 · {{name}}',
  },
  llm: {
    anthropic: {
      endpoint: {
        desc: '除默认地址外，必须包含 http(s)://',
        placeholder: 'https://api.anthropic.com',
        title: 'API 代理地址',
      },
      title: 'Anthropic',
      token: {
        desc: '填入来自 Anthropic 的 API Key',
        placeholder: 'Anthropic API Key',
        title: 'API Key',
      },
    },
    azure: {
      azureApiVersion: {
        desc: 'Azure 的 API 版本，遵循 YYYY-MM-DD 格式，查阅[最新版本](https://learn.microsoft.com/zh-cn/azure/ai-services/openai/reference#chat-completions)',
        fetch: '获取列表',
        title: 'Azure Api Version',
      },
      deployments: {
        desc: '使用 id=name 的语法填写你的部署模型（如部署名和模型同名，可以只填写模型名称），多个模型使用逗号（,） 隔开',
        title: 'Azure 部署模型列表',
      },

      endpoint: {
        desc: '从 Azure 门户检查资源时，可在“密钥和终结点”部分中找到此值',
        placeholder: 'https://docs-test-001.openai.azure.com',
        title: 'Azure API 地址',
      },
      models: {
        desc: '支持的模型',
        title: '模型列表',
      },
      title: 'Azure OpenAI',
      token: {
        desc: '从 Azure 门户检查资源时，可在“密钥和终结点”部分中找到此值。 可以使用 KEY1 或 KEY2',
        placeholder: 'Azure API Key',
        title: 'API Key',
      },
    },
    bedrock: {
      accessKeyId: {
        desc: '填入AWS Access Key Id',
        placeholder: 'AWS Access Key Id',
        title: 'AWS Access Key Id',
      },
      checker: {
        desc: '测试 AccessKeyId / SecretAccessKey 是否填写正确',
      },
      region: {
        desc: '填入 AWS Region',
        placeholder: 'AWS Region',
        title: 'AWS Region',
      },
      secretAccessKey: {
        desc: '填入 AWS Secret Access Key',
        placeholder: 'AWS Secret Access Key',
        title: 'AWS Secret Access Key',
      },
      title: 'Bedrock',
    },
    checker: {
      button: '检查',
      desc: '测试 Api Key 与代理地址是否正确填写',
      pass: '检查通过',
      title: '连通性检查',
    },
    google: {
      title: 'Google',
      token: {
        desc: '填入来自 Google 的 API Key',
        placeholder: 'Google API Key',
        title: 'API Key',
      },
    },
    groq: {
      title: 'Groq',
      token: {
        desc: '填入来自 Groq 的 API Key',
        placeholder: 'Groq API Key',
        title: 'API Key',
      },
    },
    mistral: {
      title: 'Mistral AI',
      token: {
        desc: '填入来自 Mistral AI 的 API Key',
        placeholder: 'Mistral AI API Key',
        title: 'API Key',
      },
    },
    moonshot: {
      title: '月之暗面',
      token: {
        desc: '填入来自 Moonshot AI 的 API Key',
        placeholder: 'Moonshot AI API Key',
        title: 'API Key',
      },
    },
    ollama: {
      checker: {
        desc: '测试代理地址是否正确填写',
      },
      customModelName: {
        desc: '增加自定义模型，多个模型使用逗号（,）隔开',
        placeholder: 'vicuna,llava,codellama,llama2:13b-text',
        title: '自定义模型名称',
      },
      endpoint: {
        desc: '填入 Ollama 接口代理地址，本地未额外指定可留空',
        placeholder: 'http://127.0.0.1:11434/v1',
        title: '接口代理地址',
      },
      title: 'Ollama',
    },
    openai: {
      azureApiVersion: {
        desc: 'Azure 的 API 版本，遵循 YYYY-MM-DD 格式，查阅[最新版本](https://learn.microsoft.com/zh-cn/azure/ai-services/openai/reference#chat-completions)',
        fetch: '获取列表',
        title: 'Azure Api Version',
      },
      customModelName: {
        desc: '增加自定义模型，多个模型使用逗号（,） 隔开',
        placeholder: 'model1,model2,model3',
        title: '自定义模型名称',
      },
      endpoint: {
        desc: '除默认地址外，必须包含 http(s)://',
        placeholder: 'https://api.openai.com/v1',
        title: '接口代理地址',
      },
      models: {
        count: '共支持 {{count}} 个模型',
        desc: '支持的模型',
        fetch: '获取模型列表',
        notSupport: 'Azure OpenAI 暂不支持查看模型列表',
        notSupportTip: '你需要自行确保部署名称与模型名称一致',
        refetch: '重新获取模型列表',
        title: '模型列表',
      },
      title: 'OpenAI',
      token: {
        desc: '使用自己的 OpenAI Key',
        placeholder: 'OpenAI API Key',
        title: 'OpenAI API Key',
      },
      useAzure: {
        desc: '使用 Azure 提供的 OpenAI 服务',
        fetch: '获取列表',
        serverConfig: '管理员在服务端配置开启了 Azure OpenAI，禁止切换',
        title: 'Azure OpenAI',
      },
    },
    openrouter: {
      checker: {
        desc: '测试代理地址是否正确填写',
      },
      customModelName: {
        desc: '增加自定义模型，多个模型使用逗号（,）隔开',
        placeholder: 'mistralai/mistral-7b-instruct:free,openchat/openchat-7b:free',
        title: '自定义模型名称',
      },
      title: 'OpenRouter',
      token: {
        desc: '填入来自 OpenRouter AI 的 API Key',
        placeholder: 'OpenRouter AI API Key',
        title: 'API Key',
      },
    },
    perplexity: {
      title: 'Perplexity',
      token: {
        desc: '填入来自 Perplexity AI 的 API Key',
        placeholder: 'Perplexity AI API Key',
        title: 'API Key',
      },
    },
    togetherai: {
      checker: {
        desc: '测试代理地址是否正确填写',
      },
      customModelName: {
        desc: '增加自定义模型，多个模型使用逗号（,）隔开',
        placeholder: 'togethercomputer/Llama-2-7B-32K-Instruct,teknium/OpenHermes-2-Mistral-7B',
        title: '自定义模型名称',
      },
      title: 'TogetherAI',
      token: {
        desc: '填入来自 TogetherAI AI 的 API Key',
        placeholder: 'TogetherAI AI API Key',
        title: 'API Key',
      },
    },
    waitingForMore: '更多模型正在 <1>计划接入</1> 中，敬请期待 ✨',
    zeroone: {
      title: '01.AI 零一万物',
      token: {
        desc: '填入来自 01.AI 零一万物的 API Key',
        placeholder: '01.AI 零一万物 API Key',
        title: 'API Key',
      },
    },
    zhipu: {
      title: '智谱',
      token: {
        desc: '填入来自智谱的 API Key',
        placeholder: 'Zhipu API Key',
        title: 'API Key',
      },
    },
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
