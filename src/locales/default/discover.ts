export default {
  assistants: {
    addAgent: '添加助手',
    addAgentAndConverse: '添加助手并会话',
    addAgentSuccess: '添加成功',
    conversation: {
      l1: '你好，我是 **{{name}}**，你可以问我任何问题，我会尽力回答你 ~',
      l2: '以下是我的能力介绍: ',
      l3: '让我们开始对话吧！',
    },
    description: '助手介绍',
    detail: '详情',
    details: {
      capabilities: {
        knowledge: {
          desc: '助手内置了以下知识库，帮助你回答更多问题。',
          title: '知识库',
        },
        plugin: {
          desc: '助手内置了以下插件，帮助你完成更多任务。',
          title: '内置插件',
        },
        title: '助手能力',
      },
      overview: {
        example: '助手演示',
        title: '概览',
      },
      related: {
        listTitle: '相关助手',
        more: '查看更多',
        title: '相关推荐',
      },
      sidebar: {
        toc: '目录',
      },
      summary: {
        title: '你可以使用该助手做什么？',
      },
      systemRole: {
        openingMessage: '开场消息',
        openingQuestions: '开场问题',
        title: '助手设定',
      },
    },
    list: '助手列表',
    more: '更多',
    plugins: '集成插件',
    recentSubmits: '最近更新',
    sorts: {
      createdAt: '最近发布',
      identifier: '助手 ID',
      knowledgeCount: '知识库数量',
      pluginCount: '插件数量',
      title: '助手名称',
      tokenUsage: 'Token 使用量',
    },
    suggestions: '相关推荐',
    systemRole: '助手设定',
    tokenUsage: '助手提示词 Token 使用量',
    try: '试一下',
    withKnowledge: '该助手附带知识库',
    withPlugin: '该助手附带插件',
  },
  back: '返回发现',
  category: {
    assistant: {
      academic: '学术',
      all: '全部',
      career: '职业',
      copywriting: '文案',
      design: '设计',
      education: '教育',
      emotions: '情感',
      entertainment: '娱乐',
      games: '游戏',
      general: '通用',
      life: '生活',
      marketing: '商业',
      office: '办公',
      programming: '编程',
      translation: '翻译',
    },
    plugin: {
      'all': '全部',
      'gaming-entertainment': '游戏娱乐',
      'life-style': '生活方式',
      'lifestyle': '生活方式',
      'media-generate': '媒体生成',
      'science-education': '科学教育',
      'social': '社交媒体',
      'stocks-finance': '股票金融',
      'tools': '实用工具',
      'web-search': '网络搜索',
    },
  },
  cleanFilter: '清除筛选',
  create: '创作',
  createGuide: {
    func1: {
      desc1: '在会话窗口中通过右上角设置进入你想提交助手的设置页面;',
      desc2: '点击右上角提交到助手市场按钮。',
      tag: '方法一',
      title: '通过 LobeChat 提交',
    },
    func2: {
      button: '前往 Github 助手仓库',
      desc: '如果您想将助手添加到索引中，请使用 agent-template.json 或 agent-template-full.json 在 plugins 目录中创建一个条目，编写简短的描述并适当标记，然后创建一个拉取请求。',
      tag: '方法二',
      title: '通过 Github 提交',
    },
  },
  dislike: '不喜欢',
  filter: '筛选',
  filterBy: {
    authorRange: {
      everyone: '所有作者',
      followed: '关注的作者',
      title: '作者范围',
    },
    contentLength: '最小上下文长度',
    maxToken: {
      title: '设定最大长度 (Token)',
      unlimited: '无限制',
    },
    other: {
      functionCall: '支持函数调用',
      title: '其他',
      vision: '支持视觉识别',
      withKnowledge: '附带知识库',
      withTool: '附带插件',
    },
    pricing: '模型价格',
    timePeriod: {
      all: '全部时间',
      day: '近 24 小时',
      month: '近 30 天',
      title: '时间范围',
      week: '近 7 天',
      year: '近一年',
    },
  },
  home: {
    featuredAssistants: '推荐助手',
    featuredModels: '推荐模型',
    featuredProviders: '推荐模型服务商',
    featuredTools: '推荐插件',
    more: '发现更多',
  },
  isClaimed: '已认领',
  isFeatured: '推荐',
  isOfficial: '官方认证',
  like: '喜欢',
  mcp: {
    categories: {
      'all': {
        description: '全部 MCP Servers',
        name: '全部',
      },
      'business': {
        description: '商业与企业服务',
        name: '商业服务',
      },
      'developer': {
        description: '开发相关的工具与服务',
        name: '开发工具',
      },
      'gaming-entertainment': {
        description: '游戏、娱乐和休闲活动',
        name: '游戏娱乐',
      },
      'health-wellness': {
        description: '健康、健身与身心养护',
        name: '健康养生',
      },
      'lifestyle': {
        description: '个人生活方式、习惯与日常活动',
        name: '生活方式',
      },
      'media-generate': {
        description: '媒体的生成、编辑与处理',
        name: '媒体生成',
      },
      'news': {
        description: '新闻聚合、报道与资讯服务',
        name: '新闻咨询',
      },
      'productivity': {
        description: '任务管理、笔记与效率工具',
        name: '效率工具',
      },
      'science-education': {
        description: '科学研究、学习与教育工具',
        name: '科学教育',
      },
      'social': {
        description: '社交网络与沟通交流',
        name: '社交媒体',
      },
      'stocks-finance': {
        description: '金融市场、交易与投资',
        name: '股票金融',
      },
      'tools': {
        description: '通用实用工具与服务',
        name: '实用工具',
      },
      'travel-transport': {
        description: '旅行规划与交通出行',
        name: '旅行交通',
      },
      'weather': {
        description: '天气预报与气象服务',
        name: '气象天气',
      },
      'web-search': {
        description: '网页搜索与信息检索',
        name: '信息检索',
      },
    },
    details: {
      connectionType: {
        hybrid: {
          desc: '该服务可根据配置或使用场景，在本地或云端运行，具备双重运行能力。',
          title: '混合型服务',
        },
        local: {
          desc: '该服务器只能在客户端本地设备上运行，需安装并依赖本地资源。',
          title: '本地服务',
        },
        remote: {
          desc: '该服务器托管在远程运行，因为它主要依赖远程服务，不依赖本地环境。',
          title: '云服务',
        },
      },
      deployment: {
        args: '参数',
        checkCommand: '检查命令',
        command: '命令',
        commandLine: '系统依赖',
        connection: '连接方式',
        connectionType: '连接类型',
        description: '插件的安装和部署方式',
        descriptionPlaceholder: '可选的描述信息',
        empty: '暂无部署选项',
        env: '环境变量',
        guide: '安装说明',
        installation: '通过 {{method}} 安装',
        installationMethod: '安装方式',
        other: '其他设置',
        packageName: '包名称',
        platform: {
          steps: {
            claude:
              '- 打开 **Claude Desktop** 应用\n- 前往 **设置**，然后选择 **开发者**\n- 点击 **编辑配置**\n- 打开 **claude_desktop_config.json** 文件\n- 复制并粘贴服务器配置到现有文件中，然后保存',
            cline:
              '- 打开安装了 Cline 扩展的 VS Code\n- 点击侧边栏中的 Cline 图标\n- 从下拉菜单中选择 **MCP Servers**\n- 在 **Remote Servers** 标签页中，输入服务器名称和您的 MCP 服务器 URL\n- 点击 **Add Server** 进行连接',
            cursor:
              '- 导航到 **设置**，然后选择 Cursor 设置\n- 在左侧选择 **MCP**\n- 点击右上角的 **添加新的全局 MCP 服务器**\n- 复制并粘贴服务器配置到现有文件中，然后保存',
            lobeChat:
              '- 打开 **LobeChat 桌面版** 应用\n- 前往 **设置** - **默认助手**\n- 然后选择 **插件设置** - **自定义插件**\n- 点击 **快速导入 JSON 配置**\n- 复制并粘贴服务器配置到文本框，然后安装',
            openai:
              '- 打开您的 **OpenAI 应用** 或开发环境\n- 在 **Responses API** 中配置 MCP 工具\n- 在 API 请求的 **tools** 数组中添加 MCP 块\n- 设置 **server_url** 为您的 MCP 服务器端点\n- 包含认证所需的头部信息（API 密钥、令牌等）\n- 使用 `allowed_tools` 参数限制暴露的工具\n- 设置 `require_approval` 来控制工具执行审批',
            vscode:
              '- 打开 VS Code\n- 打开命令面板（`Ctrl+Shift+P` / `Cmd+Shift+P`）\n- 输入 **MCP: Add Server** 并选择它\n- 选择添加到工作区或用户设置\n- 复制并粘贴服务器配置',
          },
          title: '在 {{platform}} 中安装',
        },
        recommended: '推荐',
        systemDependencies: '系统依赖',
        table: {
          description: '描述',
          name: '名称',
          required: '必填',
          type: '类型',
        },
        title: '安装方式',
      },
      githubBadge: {
        desc: 'LobeHub 定期对代码库和文档进行扫描，以便于：\n\n- 确认 MCP 服务器正常运行。\n- 提取服务器特性，例如工具、资源、提示信息以及所需参数。\n- 我们的 Badge 帮助用户快速评估 MCP 服务器的安全性、功能特性以及安装指南。\n\n请将以下代码复制到你的 `README.md` 文件中：',
      },
      nav: {
        needHelp: '需要帮助？',
        reportIssue: '报告问题',
        viewSourceCode: '查看源码',
      },
      overview: {
        title: '概览',
      },
      related: {
        listTitle: '相关 MCP Server',
        more: '查看更多',
        title: '相关推荐',
      },
      schema: {
        mode: {
          docs: '文档',
        },
        prompts: {
          arguments: '参数配置',
          desc: '由用户选择触发的交互式模板',
          empty: '暂无提示词',
          instructions: '指令说明',
          table: {
            description: '描述',
            name: '名称',
            required: '必填',
          },
          title: '提示词列表',
        },
        resources: {
          desc: '由客户端附加和管理的上下文数据',
          empty: '暂无资源',
          table: {
            description: '描述',
            mineType: 'MIME 类型',
            name: '名称',
            uri: 'URI',
          },
          title: '资源列表',
        },
        title: '插件功能',
        tools: {
          desc: '向大语言模型（LLM）暴露的功能接口以执行操作',
          empty: '暂无工具',
          inputSchema: '输入描述',
          instructions: '指令说明',
          table: {
            description: '描述',
            name: '名称',
            required: '必填',
            type: '类型',
          },
          title: '工具列表',
        },
      },
      score: {
        claimed: {
          desc: '此 MCP Server 已被所有者认领，确保其所有权和管理。',
          title: '已被所有者认领',
        },
        deployMoreThanManual: {
          desc: '该 MCP Server 提供了除 Manual 外更友好的安装方式，允许用户轻松部署和使用。',
          title: '提供友好的安装方式',
        },
        deployment: {
          desc: '该 MCP Server 提供了至少一种安装方式，允许用户部署和使用。',
          descWithCount: '该 MCP Server 提供了 {{number}} 种安装方式，允许用户部署和使用。',
          title: '提供至少一种安装方式',
        },
        license: {
          desc: '该仓库包含一个 LICENSE 文件。',
          descWithlicense: '该仓库许可证为 {{license}}。',
          title: '具有 LICENSE',
        },
        listTitle: '评分明细',
        notClaimed: {
          desc: '如果您是此 MCP Server 所有者，可通过以下方式认领。',
          title: '未被所有者认领',
        },
        prompts: {
          desc: '该 MCP Server 提供了提示词，允许用户与服务进行交互。',
          descWithCount: '该 MCP Server 提供了 {{number}} 个提示词，允许用户与服务进行交互。',
          title: '包含提示词',
        },
        readme: {
          desc: '该仓库包含一个 README.md 文件。',
          title: '具有 README',
        },
        resources: {
          desc: '该 MCP Server 提供了资源，允许用户附加和管理上下文数据。',
          descWithCount: '该 MCP Server 提供了 {{number}} 个资源，允许用户附加和管理上下文数据。',
          title: '包含资源',
        },
        title: '评分',
        tools: {
          desc: '服务需提供至少一个工具，允许用户执行特定操作。',
          descWithCount: '该 MCP Server 提供了 {{number}} 个工具功能，允许用户执行特定操作。',
          title: '包含至少一个工具',
        },
        validated: {
          desc: '该 MCP Server 已通过安装验证，确保其质量和可靠性。',
          title: '已通过验证',
        },
      },
      scoreLevel: {
        a: {
          desc: '该 MCP Server 经过严格验证，提供了全面的功能和高质量的用户体验。',
          fullTitle: '优秀插件',
          title: '优质',
        },
        b: {
          desc: '该 MCP Server 提供了良好的功能和用户体验，但可能在某些方面需要改进。',
          fullTitle: '功能良好',
          title: '良好',
        },
        f: {
          desc: '该 MCP Server 功能不完整或质量较低，建议用户谨慎使用。',
          fullTitle: '质量欠佳',
          title: '欠佳',
        },
      },
      settings: {
        capabilities: {
          prompts: '提示词',
          resources: '资源',
          title: '插件能力',
          tools: '工具',
        },
        configuration: {
          title: '插件配置',
        },
        connection: {
          args: '启动参数',
          command: '启动命令',
          title: '连接信息',
          type: '连接类型',
          url: '服务地址',
        },
        saveSettings: '保存设置',
        title: '插件设置',
      },
      sidebar: {
        install: '安装 MCP Server',
        meta: {
          homepage: '官网主页',
          installCount: '安装数',
          language: '源码语种',
          license: '许可证',
          published: '发布时间',
          repo: '源码仓库',
          stars: '星标数',
          title: '详细信息',
          updated: '最近更新',
        },
        moreServerConfig: '查看详情',
        recommendServers: '相关 MCP',
        serverConfig: '安装配置',
        toc: '目录',
      },
      summary: {
        title: '你可以使用该 MCP Server 做什么？',
      },
      totalScore: {
        description: '根据各项指标综合计算得出的总分',
        legend: {
          aGrade: 'A级 ({{minPercent}}-100%)',
          bGrade: 'B级 ({{minPercent}}-{{maxPercent}}%)',
          fGrade: 'F级 (0-{{maxPercent}}%)',
        },
        pointsFormat: '{{score}}/{{total}} 分',
        popover: {
          completedOptional: '✅ 已完成可选项 ({{count}}项)',
          completedRequired: '✅ 已完成必需项 ({{count}}项)',
          incompleteOptional: '⏸️ 未完成可选项 ({{count}}项)',
          incompleteRequired: '❌ 未完成必需项 ({{count}}项)',
          title: '评分详情',
        },
        ratingFormat: '评级: {{level}}',
        scoreInfo: {
          items: '项',
          points: '分',
          requiredItems: '必需项',
        },
        title: '总分',
      },
      versions: {
        table: {
          isLatest: '最新版本',
          isValidated: '通过验证',
          publishAt: '发布时间',
          version: '版本',
        },
        title: '版本历史',
      },
    },
    hero: {
      desc: '开源、可部署的 MCP Servers 平台，帮助 AI 系统轻松访问文件系统、数据库、API 等关键资源，全面扩展你的 AI 能力。',
      subTitle: '开源 & 开箱即用',
      title: '面向 AI 的开源 MCP 市场',
    },
    sorts: {
      createdAt: '最近新增',
      installCount: '安装数',
      isFeatured: '推荐插件',
      isValidated: '已验证插件',
      promptsCount: '提示词数',
      ratingCount: '评分数',
      resourcesCount: '资源数',
      toolsCount: '工具数',
      updatedAt: '最近更新',
    },
    title: 'MCP 市场',
    unvalidated: {
      desc: '此 MCP Server 暂未经过验证',
      title: '未验证',
    },
    validated: {
      desc: '此 MCP Server 经过验证，确保其质量和可靠性。',
      descWithDate: '此 MCP Server 于 {{date}} 经过验证，确保其质量和可靠性。',
      title: '已验证',
    },
  },
  models: {
    abilities: '模型能力',
    chat: '开始会话',
    contentLength: '最大上下文长度',
    details: {
      overview: {
        title: '概览',
      },
      related: {
        listTitle: '相关模型',
        more: '查看更多',
        title: '相关推荐',
      },
    },
    free: '免费',
    guide: '配置指南',
    list: '模型列表',
    more: '更多',
    parameterList: {
      defaultValue: '默认值',
      docs: '查看文档',
      frequency_penalty: {
        desc: '此设置调整模型重复使用输入中已经出现的特定词汇的频率。较高的值使得这种重复出现的可能性降低，而负值则产生相反的效果。词汇惩罚不随出现次数增加而增加。负值将鼓励词汇的重复使用。',
        title: '频率惩罚度',
      },
      max_tokens: {
        desc: '此设置定义了模型在单次回复中可以生成的最大长度。设置较高的值允许模型生成更长的回应，而较低的值则限制回应的长度，使其更简洁。根据不同的应用场景，合理调整此值可以帮助达到预期的回应长度和详细程度。',
        title: '单次回复限制',
      },
      presence_penalty: {
        desc: '此设置旨在根据词汇在输入中出现的频率来控制词汇的重复使用。它尝试较少使用那些在输入中出现较多的词汇，其使用频率与出现频率成比例。词汇惩罚随出现次数而增加。负值将鼓励重复使用词汇。',
        title: '话题新鲜度',
      },
      range: '范围',
      reasoning_effort: {
        desc: '此设置用于控制模型在生成回答前的推理强度。低强度优先响应速度并节省 Token，高强度提供更完整的推理，但会消耗更多 Token 并降低响应速度。默认值为中，平衡推理准确性与响应速度。',
        title: '推理强度',
      },
      temperature: {
        desc: '此设置影响模型回应的多样性。较低的值会导致更可预测和典型的回应，而较高的值则鼓励更多样化和不常见的回应。当值设为0时，模型对于给定的输入总是给出相同的回应。',
        title: '随机性',
      },
      title: '模型参数',
      top_p: {
        desc: '此设置将模型的选择限制为可能性最高的一定比例的词汇：只选择那些累计概率达到P的顶尖词汇。较低的值使得模型的回应更加可预测，而默认设置则允许模型从全部范围的词汇中进行选择。',
        title: '核采样',
      },
      type: '类型',
    },
    providerInfo: {
      apiTooltip: 'LobeChat 支持为此提供商使用自定义 API 密钥。',
      input: '输入价格',
      inputTooltip: '每百万个 Token 的成本',
      latency: '延迟',
      latencyTooltip: '服务商发送第一个 Token 的平均响应时间',
      maxOutput: '最大输出长度',
      maxOutputTooltip: '此端点可以生成的最大 Token 数',
      officialTooltip: 'LobeHub 官方服务',
      output: '输出价格',
      outputTooltip: '每百万个 Token 的成本',
      streamCancellationTooltip: '此服务商支持流取消功能。',
      throughput: '吞吐量',
      throughputTooltip: '流请求每秒传输的平均 Token 数',
    },
    sorts: {
      contextWindowTokens: '上下文长度',
      identifier: '模型 ID',
      inputPrice: '输入价格',
      outputPrice: '输出价格',
      providerCount: '服务商数量',
      releasedAt: '最近发布',
    },
    suggestions: '相关模型',
    supportedProviders: '支持该模型的服务商',
  },
  plugins: {
    community: '社区插件',
    details: {
      settings: {
        title: '插件设置',
      },
      summary: {
        title: '你可以使用该插件做什么？',
      },
      tools: {
        title: '插件工具',
      },
    },
    install: '安装插件',
    installed: '已安装',
    list: '插件列表',
    meta: {
      description: '描述',
      parameter: '参数',
      title: '工具参数',
      type: '类型',
    },
    more: '更多',
    official: '官方插件',
    recentSubmits: '最近更新',
    sorts: {
      createdAt: '最近发布',
      identifier: '插件 ID',
      title: '插件名称',
    },
    suggestions: '相关推荐',
  },
  providers: {
    config: '配置服务商',
    details: {
      guide: {
        title: '接入指南',
      },
      overview: {
        title: '概览',
      },
      related: {
        listTitle: '相关服务商',
        more: '查看更多',
        title: '相关推荐',
      },
    },
    list: '模型服务商列表',
    modelCount: '{{count}} 个模型',
    modelName: '模型名称',
    modelSite: '模型文档',
    more: '更多',
    officialSite: '官方网站',
    showAllModels: '显示所有模型',
    sorts: {
      default: '默认排序',
      identifier: '服务商 ID',
      modelCount: '模型数量',
    },
    suggestions: '相关服务商',
    supportedModels: '支持模型',
  },
  publishedTime: '发布于',
  search: {
    placeholder: '搜索名称介绍或关键词...',
    result: '{{count}} 个关于 <highlight>{{keyword}}</highlight> 的搜索结果',
    searching: '搜索中...',
  },
  tab: {
    assistant: '助手',
    home: '首页',
    model: '模型',
    plugin: '插件',
    provider: '模型服务商',
  },
};
