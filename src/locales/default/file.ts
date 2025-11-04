export default {
  desc: '管理你的知识',
  detail: {
    basic: {
      createdAt: '创建时间',
      filename: '文件名',
      size: '文件大小',
      title: '基本信息',
      type: '格式',
      updatedAt: '更新时间',
    },
    data: {
      chunkCount: '分块数',
      embedding: {
        default: '暂未向量化',
        error: '失败',
        pending: '待启动',
        processing: '进行中',
        success: '已完成',
      },
      embeddingStatus: '向量化',
    },
  },
  empty: '暂无已上传文件/文件夹',
  header: {
    actions: {
      newFolder: '新建文件夹',
      uploadFile: '上传文件',
      uploadFolder: '上传文件夹',
    },
    newNoteButton: '新建笔记',
    newNoteDialog: {
      cancel: '取消',
      editTitle: '编辑笔记',
      emptyContent: '笔记内容不能为空',
      loadError: '加载笔记失败,请重试',
      loading: '加载中...',
      save: '保存',
      saveError: '保存笔记失败,请重试',
      saveSuccess: '笔记保存成功',
      title: '新建笔记',
      updateSuccess: '笔记更新成功',
    },
    uploadButton: '上传',
  },
  home: {
    getStarted: '开始使用',
    greeting: {
      afternoon: '下午好',
      evening: '晚上好',
      morning: '早上好',
    },
    quickActions: '快捷操作',
    recentFiles: '最近文件',
    subtitle: '欢迎使用知识库，从这里开始管理你的文档和笔记',
    uploadEntries: {
      files: {
        title: '上传文件',
      },
      markdown: {
        title: '上传 Markdown',
        uploading: '上传中...',
      },
      newNote: {
        defaultTitle: '未命名笔记',
        title: '新建笔记',
      },
    },
  },
  knowledgeBase: {
    list: {
      confirmRemoveKnowledgeBase:
        '即将删除该知识库，其中的文件不会删除，将移入全部文件中。知识库删除后将不可恢复，请谨慎操作。',
      empty: '点击 <1>+</1> 开始创建知识库',
    },
    new: '新建知识库',
    title: '知识库',
  },
  networkError: '获取知识库失败，请检测网络连接后重试',
  notSupportGuide: {
    desc: '当前部署实例为客户端数据库模式，无法使用文件管理功能。请切换到<1>服务端数据库部署模式</1>，或直接使用 <3>LobeChat Cloud</3>',
    features: {
      allKind: {
        desc: '支持主流文件类型，包括 Word、PPT、Excel、PDF、TXT 等常见文档格式，以及JS、Python 等主流代码文件',
        title: '多种文件类型解析',
      },
      embeddings: {
        desc: '使用高性能向量模型，对文本分块进行向量化，实现文件内容的语义化检索',
        title: '向量语义化',
      },
      repos: {
        desc: '支持创建知识库，并允许添加不同类型的文件，构建属于你的领域知识',
        title: '知识库',
      },
    },
    title: '当前部署模式不支持文件管理',
  },
  notesEditor: {
    addIcon: '添加图标',
    emojiPicker: {
      tooltip: '选择图标',
    },
    saving: '保存中...',
    titlePlaceholder: '无标题',
  },
  notesList: {
    empty: '暂无笔记，点击上方按钮创建你的第一篇笔记',
    noResults: '未找到匹配的笔记',
    selectNote: '选择一个笔记开始编辑',
    untitled: '无标题',
  },
  preview: {
    downloadFile: '下载文件',
    unsupportedFileAndContact: '此文件格式暂不支持在线预览，如有预览诉求，欢迎<1>反馈给我们</1>',
  },
  searchFilePlaceholder: '搜索文件',
  tab: {
    all: '全部',
    audios: '语音',
    documents: '文档',
    images: '图片',
    moreTypes: '更多类型',
    videos: '视频',
    websites: '网页',
  },
  title: '知识库',
  toggleLeftPanel: {
    title: '显示/隐藏左侧面板',
  },
  uploadDock: {
    body: {
      collapse: '收起',
      item: {
        done: '已上传',
        error: '上传失败，请重试',
        pending: '准备上传...',
        processing: '文件处理中...',
        restTime: '剩余 {{time}}',
      },
    },
    fileQueueInfo: '正在上传前 {{count}} 个文件，剩余 {{remaining}} 个文件将排队上传',
    totalCount: '共 {{count}} 项',
    uploadStatus: {
      error: '上传出错',
      pending: '等待上传',
      processing: '正在上传',
      success: '上传完成',
      uploading: '正在上传',
    },
  },
};
