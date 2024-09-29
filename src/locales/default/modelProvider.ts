export default {
  azure: {
    azureApiVersion: {
      desc: 'Azure 的 API 版本，遵循 YYYY-MM-DD 格式，查阅[最新版本](https://learn.microsoft.com/zh-cn/azure/ai-services/openai/reference#chat-completions)',
      fetch: '获取列表',
      title: 'Azure API Version',
    },
    empty: '请输入模型 ID 添加第一个模型',
    endpoint: {
      desc: '从 Azure 门户检查资源时，可在“密钥和终结点”部分中找到此值',
      placeholder: 'https://docs-test-001.openai.azure.com',
      title: 'Azure API 地址',
    },
    modelListPlaceholder: '请选择或添加你部署的 OpenAI 模型',
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
    sessionToken: {
      desc: '如果你正在使用 AWS SSO/STS，请输入你的 AWS Session Token',
      placeholder: 'AWS Session Token',
      title: 'AWS Session Token (可选)',
    },
    title: 'Bedrock',
    unlock: {
      customRegion: '自定义服务区域',
      customSessionToken: '自定义 Session Token',
      description:
        '输入你的 AWS AccessKeyId / SecretAccessKey 即可开始会话。应用不会记录你的鉴权配置',
      title: '使用自定义 Bedrock 鉴权信息',
    },
  },
  github: {
    personalAccessToken: {
      desc: '填入你的 Github PAT，点击[这里](https://github.com/settings/tokens) 创建',
      placeholder: 'ghp_xxxxxx',
      title: 'Github PAT',
    },
  },
  ollama: {
    checker: {
      desc: '测试代理地址是否正确填写',
      title: '连通性检查',
    },
    customModelName: {
      desc: '增加自定义模型，多个模型使用逗号（,）隔开',
      placeholder: 'vicuna,llava,codellama,llama2:13b-text',
      title: '自定义模型名称',
    },
    download: {
      desc: 'Ollama 正在下载该模型，请尽量不要关闭本页面。重新下载时将会中断处继续',
      remainingTime: '剩余时间',
      speed: '下载速度',
      title: '正在下载模型 {{model}} ',
    },
    endpoint: {
      desc: '填入 Ollama 接口代理地址，本地未额外指定可留空',
      title: 'Ollama 服务地址',
    },
    setup: {
      cors: {
        description: '因浏览器安全限制，你需要为 Ollama 进行跨域配置后方可正常使用。',
        linux: {
          env: '在 [Service] 部分下添加 `Environment`，添加 OLLAMA_ORIGINS 环境变量：',
          reboot: '重载 systemd 并重启 Ollama',
          systemd: '调用 systemd 编辑 ollama 服务：',
        },
        macos: '请打开「终端」应用程序，并粘贴以下指令，并按回车运行',
        reboot: '请在执行完成后重启 Ollama 服务',
        title: '配置 Ollama 允许跨域访问',
        windows:
          '在 Windows 上，点击「控制面板」，进入编辑系统环境变量。为您的用户账户新建名为 「OLLAMA_ORIGINS」 的环境变量，值为 * ，点击 「OK/应用」 保存',
      },
      install: {
        description: '请确认你已经开启 Ollama ，如果没有下载 Ollama ，请前往官网<1>下载</1>',
        docker:
          '如果你更倾向于使用 Docker，Ollama 也提供了官方 Docker 镜像，你可以通过以下命令拉取：',
        linux: {
          command: '通过以下命令安装：',
          manual: '或者，你也可以参考 <1>Linux 手动安装指南</1> 自行安装',
        },
        title: '在本地安装并开启 Ollama 应用',
        windowsTab: 'Windows (预览版)',
      },
    },
    title: 'Ollama',
    unlock: {
      cancel: '取消下载',
      confirm: '下载',
      description: '输入你的 Ollama 模型标签，完成即可继续会话',
      downloaded: '{{completed}} / {{total}}',
      starting: '开始下载...',
      title: '下载指定的 Ollama 模型',
    },
  },
  zeroone: {
    title: '01.AI 零一万物',
  },
  zhipu: {
    title: '智谱',
  },
};
