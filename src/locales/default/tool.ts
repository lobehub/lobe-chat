export default {
  'agentGroupManagement': {
    executeTask: {
      intervention: {
        taskPlaceholder: '请详细描述需要助理执行的任务…',
        timeout: '最长执行时间',
        timeoutUnit: '分钟',
        unknownAgent: '未知助理',
      },
    },
  },
  'codeInterpreter': {
    error: '执行错误',
    executing: '执行中…',
    files: '文件：',
    output: '输出：',
    returnValue: '返回值：',
  },
  'lobe-knowledge-base': {
    readKnowledge: {
      meta: {
        chars: '字符数',
        lines: '行数',
      },
    },
  },
  'localFiles': {
    editFile: {
      replaceAll: '替换全部匹配项',
      replaceFirst: '仅替换第一个匹配项',
    },
    moveFiles: {
      itemsMoved: '已移动 {{count}} 个项目：',
      itemsToMove: '{{count}} 个项目待移动：',
    },
    openFile: '打开文件',
    openFolder: '打开文件夹',
    writeFile: {
      characters: '字符',
      preview: '内容预览',
    },
  },
  'search': {
    createNewSearch: '创建新的搜索记录',
    emptyResult: '未找到结果。你可以更换关键词后再试',
    includedTooltip: '当前搜索结果会进入会话的上下文中',
    scoreTooltip: '相关性分数，该分数越高说明与查询关键词越相关',
    searchBar: {
      button: '搜索',
      placeholder: '关键词',
      tooltip: '将会重新获取搜索结果，并创建一条新的总结消息',
    },
    searchCategory: {
      placeholder: '搜索类别',
      title: '搜索类别：',
      value: {
        files: '文件',
        general: '通用',
        images: '图片',
        it: '信息技术',
        map: '地图',
        music: '音乐',
        news: '新闻',
        science: '科学',
        social_media: '社交媒体',
        videos: '视频',
      },
    },
    searchEngine: {
      placeholder: '搜索引擎',
      title: '搜索引擎：',
    },
    searchResult: '搜索数量：',
    searchTimeRange: {
      title: '时间范围：',
      value: {
        anytime: '时间不限',
        day: '一天内',
        month: '一月内',
        week: '一周内',
        year: '一年内',
      },
    },
    summaryTooltip: '总结当前内容',
    viewMoreResults: '查看更多 {{results}} 个结果',
  },
  'updateArgs': {
    duplicateKeyError: '字段键必须唯一',
    form: {
      add: '添加一项',
      key: '字段键',
      value: '字段值',
    },
    formValidationFailed: '表单验证失败，请检查参数格式',
    keyRequired: '字段键不能为空',
  },
};
