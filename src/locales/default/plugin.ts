export default {
  debug: {
    arguments: '调用参数',
    function_call: '函数调用',
    response: '返回结果',
  },
  dev: {
    confirmDeleteDevPlugin: '即将删除该本地插件，删除后将无法找回，是否删除该插件？',
    deleteSuccess: '插件删除成功',
    manifest: {
      identifier: {
        desc: '插件的唯一标识',
        label: '标识符',
      },
      mode: {
        'local': '可视化配置',
        'local-tooltip': '暂时不支持可视化配置',
        'url': '在线链接',
      },
      name: {
        desc: '插件标题',
        label: '标题',
        placeholder: '搜索引擎',
      },
    },
    meta: {
      author: {
        desc: '插件的作者',
        label: '作者',
      },
      avatar: {
        desc: '插件的图标，可以使用 Emoji，也可以使用 URL',
        label: '图标',
      },
      description: {
        desc: '插件描述',
        label: '描述',
        placeholder: '查询搜索引擎获取信息',
      },
      formFieldRequired: '该字段为必填项',
      homepage: {
        desc: '插件的首页',
        label: '首页',
      },
      identifier: {
        desc: '插件的唯一标识，仅支持英文字符、数字、破折号 - 、下划线 _',
        errorDuplicate: '标识符和已有插件重复，请修改标识符',
        label: '标识符',
        pattenErrorMessage: '只能输入英文字符、数字 、- 和_ 这两个符号',
      },
      manifest: {
        desc: 'LobeChat 将会通过该链接安装插件',
        jsonInvalid: ' manifest 不符合规范，校验结果: \n\n {{error}}',
        label: '插件描述文件 Url 地址',
        requestError: '请求该链接失败，请输入一个有效的链接，并检查链接是否允许跨域访问',
        urlError: '该链接没有返回 JSON 格式的内容, 请输入一个有效的链接',
      },
      title: {
        desc: '插件标题',
        label: '标题',
        placeholder: '搜索引擎',
      },
    },
    metaConfig: '插件元信息配置',
    modalDesc: '添加自定义插件后，可用于插件开发验证，也可直接在会话中使用。插件开发文档请参考',
    preview: {
      card: '预览插件展示效果',
      desc: '预览插件描述',
      title: '插件名称预览',
    },
    save: '保存',
    saveSuccess: '插件设置保存成功',
    tabs: {
      manifest: '功能描述清单 (Manifest)',
      meta: '插件元信息',
    },

    title: '添加自定义插件',
  },
  list: {
    item: {
      'local.config': '配置',
      'local.title': '本地',
    },
  },

  loading: {
    content: '数据获取中...',
    plugin: '插件运行中...',
  },
  pluginList: '插件列表',
  plugins: {
    unknown: '插件检测中...',
  },
};
