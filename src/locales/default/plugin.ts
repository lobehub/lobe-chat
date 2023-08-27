export default {
  debug: {
    arguments: '调用参数',
    function_call: '函数调用',
    response: '返回结果',
  },
  dev: {
    manifest: {
      identifier: {
        desc: '插件的唯一标识',
        label: '标识符',
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
      homepage: {
        desc: '插件的首页',
        label: '首页',
      },
      identifier: {
        desc: '插件的唯一标识',
        label: '标识符',
      },
      manifest: {
        desc: 'LobeChat 将会通过该链接安装插件',
        label: '插件描述文件 Url 地址',
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
      manifest: '插件描述文件',
      meta: '插件元信息',
    },

    title: '添加自定义插件',
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
