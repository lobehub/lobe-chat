export default {
  clerkAuth: {
    loginSuccess: {
      action: '继续会话',
      desc: '{{greeting}}，很高兴能够继续为你服务。让我们接着刚刚的话题聊下去吧',
      title: '欢迎回来， {{nickName}}',
    },
  },
  error: {
    backHome: '返回首页',
    desc: '待会来试试，或者回到已知的世界',
    retry: '重新加载',
    title: '页面遇到一点问题..',
  },
  fetchError: '请求失败',
  fetchErrorDetail: '错误详情',
  notFound: {
    backHome: '返回首页',
    desc: '我们找不到你正在寻找的页面，请检查链接是否正确',
    title: '进入了未知领域？',
  },
  pluginSettings: {
    desc: '完成以下配置，即可开始使用该插件',
    title: '{{name}} 插件配置',
  },
  response: {
    400: '很抱歉，服务器不明白您的请求，请确认您的请求参数是否正确',
    401: '很抱歉，服务器拒绝了您的请求，可能是因为您的权限不足或未提供有效的身份验证',
    403: '很抱歉，服务器拒绝了您的请求，您没有访问此内容的权限 ',
    404: '很抱歉，服务器找不到您请求的页面或资源，请确认您的 URL 是否正确',
    405: '很抱歉，服务器不支持您使用的请求方法，请确认您的请求方法是否正确',
    406: '很抱歉，服务器无法根据您请求的内容特性完成请求',
    407: '很抱歉，您需要进行代理认证后才能继续此请求',
    408: '很抱歉，服务器在等待请求时超时，请检查您的网络连接后再试',
    409: '很抱歉，请求存在冲突无法处理，可能是因为资源状态与请求不兼容',
    410: '很抱歉，您请求的资源已被永久移除，无法找到',
    411: '很抱歉，服务器无法处理不含有效内容长度的请求',
    412: '很抱歉，您的请求未满足服务器端的条件，无法完成请求',
    413: '很抱歉，您的请求数据量过大，服务器无法处理',
    414: '很抱歉，您的请求的 URI 过长，服务器无法处理',
    415: '很抱歉，服务器无法处理请求附带的媒体格式',
    416: '很抱歉，服务器无法满足您请求的范围',
    417: '很抱歉，服务器无法满足您的期望值',
    422: '很抱歉，您的请求格式正确，但是由于含有语义错误，无法响应',
    423: '很抱歉，您请求的资源被锁定',
    424: '很抱歉，由于之前的请求失败，导致当前请求无法完成',
    426: '很抱歉，服务器要求您的客户端升级到更高的协议版本',
    428: '很抱歉，服务器要求先决条件，要求您的请求包含正确的条件头',
    429: '很抱歉，您的请求太多，服务器有点累了，请稍后再试',
    431: '很抱歉，您的请求头字段太大，服务器无法处理',
    451: '很抱歉，由于法律原因，服务器拒绝提供此资源',
    500: '很抱歉，服务器似乎遇到了一些困难，暂时无法完成您的请求，请稍后再试',
    502: '很抱歉，服务器似乎迷失了方向，暂时无法提供服务，请稍后再试',
    503: '很抱歉，服务器当前无法处理您的请求，可能是由于过载或正在进行维护，请稍后再试',
    504: '很抱歉，服务器没有等到上游服务器的回应，请稍后再试',

    /* eslint-disable sort-keys-fix/sort-keys-fix */
    PluginMarketIndexNotFound: '很抱歉，服务器没有找到插件索引，请检查索引地址是否正确',
    PluginMarketIndexInvalid: '很抱歉，插件索引校验未通过，请检查索引文件格式是否规范',
    PluginMetaNotFound: '很抱歉，没有在索引中发现该插件，请插件在索引中的配置信息',
    PluginMetaInvalid: '很抱歉，该插件的元信息校验未通过，请检查插件元信息格式是否规范',
    PluginManifestNotFound:
      '很抱歉，服务器没有找到该插件的描述清单 (manifest.json)，请检查插件描述文件地址是否正确',
    PluginManifestInvalid: '很抱歉，该插件的描述清单校验未通过，请检查描述清单格式是否规范',
    PluginApiNotFound:
      '很抱歉，插件描述清单中不存在该 API ，请检查你的请求方法与插件清单 API 是否匹配',
    PluginApiParamsError: '很抱歉，该插件请求的入参校验未通过，请检查入参与 Api 描述信息是否匹配',
    PluginSettingsInvalid: '该插件需要正确配置后才可以使用，请检查你的配置是否正确',
    PluginServerError:
      '插件服务端请求返回出错，请检查根据下面的报错信息检查你的插件描述文件、插件配置或服务端实现',
    PluginGatewayError: '很抱歉，插件网关出现错误，请检查插件网关配置是否正确',
    PluginOpenApiInitError: '很抱歉，OpenAPI 客户端初始化失败，请检查 OpenAPI 的配置信息是否正确',

    PluginFailToTransformArguments:
      '很抱歉，插件调用参数解析失败，请尝试重新生成助手消息，或更换 Tools Calling 能力更强的 AI 模型后重试',

    InvalidAccessCode: '密码不正确或为空，请输入正确的访问密码，或者添加自定义 API Key',
    InvalidClerkUser: '很抱歉，你当前尚未登录，请先登录或注册账号后继续操作',
    LocationNotSupportError:
      '很抱歉，你的所在地区不支持此模型服务，可能是由于区域限制或服务未开通。请确认当前地区是否支持使用此服务，或尝试使用切换到其他地区后重试。',

    InvalidProviderAPIKey: '{{provider}} API Key 不正确或为空，请检查 {{provider}} API Key 后重试',
    ProviderBizError: '请求 {{provider}} 服务出错，请根据以下信息排查或重试',
    /**
     * @deprecated
     */
    NoOpenAIAPIKey: 'OpenAI API Key 不正确或为空，请添加自定义 OpenAI API Key',
    OpenAIBizError: '请求 OpenAI 服务出错，请根据以下信息排查或重试',

    InvalidBedrockCredentials: 'Bedrock 鉴权未通过，请检查 AccessKeyId/SecretAccessKey 后重试',

    InvalidOllamaArgs: 'Ollama 配置不正确，请检查 Ollama 配置后重试',
    OllamaBizError: '请求 Ollama 服务出错，请根据以下信息排查或重试',
    OllamaServiceUnavailable:
      'Ollama 服务连接失败，请检查 Ollama 是否运行正常，或是否正确设置 Ollama 的跨域配置',

    AgentRuntimeError: 'Lobe AI Runtime 执行出错，请根据以下信息排查或重试',

    // cloud
    FreePlanLimit: '当前为免费用户，无法使用该功能，请升级到付费计划后继续使用',
    SubscriptionPlanLimit:
      '您的订阅额度已用尽，无法使用该功能，请升级到更高计划，或购买资源包后继续使用',

    /* eslint-enable */
  },
  stt: {
    responseError: '服务请求失败，请检查配置或重试',
  },
  tts: {
    responseError: '服务请求失败，请检查配置或重试',
  },
  unlock: {
    addProxyUrl: '添加 OpenAI 代理地址（可选）',
    apiKey: {
      description: '输入你的 {{name}} API Key 即可开始会话',
      title: '使用自定义 {{name}} API Key',
    },
    closeMessage: '关闭提示',
    confirm: '确认并重试',
    oauth: {
      description: '管理员已开启统一登录认证，点击下方按钮登录，即可解锁应用',
      success: '登录成功',
      title: '登录账号',
      welcome: '欢迎你！',
    },
    password: {
      description: '管理员已开启应用加密，输入应用密码后即可解锁应用。密码只需填写一次',
      placeholder: '请输入密码',
      title: '输入密码解锁应用',
    },
    tabs: {
      apiKey: '自定义 API Key',
      password: '密码',
    },
  },
  upload: { desc: '详情: {{detail}}', title: '文件上传失败，请检查网络连接或稍后再试' },
};
