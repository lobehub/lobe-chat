export default {
  DragUpload: {
    dragDesc: '拖拽文件到这里，支持上传多个图片。',
    dragFileDesc: '拖拽图片和文件到这里，支持上传多个图片和文件。',
    dragFileTitle: '上传文件',
    dragTitle: '上传图片',
  },
  FileManager: {
    actions: {
      addToKnowledgeBase: '添加到知识库',
      addToOtherKnowledgeBase: '添加到其他知识库',
      batchChunking: '批量分块',
      chunking: '分块',
      chunkingTooltip: '将文件拆分为多个文本块并向量化后，可用于语义检索和文件对话',
      chunkingUnsupported: '该文件不支持分块',
      confirmDelete: '即将删除该文件，删除后该将无法找回，请确认你的操作',
      confirmDeleteMultiFiles:
        '即将删除选中的 {{count}} 个文件，删除后该将无法找回，请确认你的操作',
      confirmRemoveFromKnowledgeBase:
        '即将从知识库中移除选中的 {{count}} 个文件，移除后文件仍然可以在全部文件中查看，请确认你的操作',
      copyUrl: '复制链接',
      copyUrlSuccess: '文件地址复制成功',
      createChunkingTask: '准备中...',
      deleteSuccess: '文件删除成功',
      downloading: '文件下载中...',
      removeFromKnowledgeBase: '从知识库中移除',
      removeFromKnowledgeBaseSuccess: '文件移除成功',
    },
    bottom: '已经到底啦',
    config: {
      showFilesInKnowledgeBase: '显示知识库中内容',
    },
    emptyStatus: {
      actions: {
        file: '上传文件',
        folder: '上传文件夹',
        knowledgeBase: '新建知识库',
      },
      or: '或者',
      title: '将文件或文件夹拖到这里',
    },
    title: {
      createdAt: '创建时间',
      size: '大小',
      title: '文件',
    },
    total: {
      fileCount: '共 {{count}} 项',
      selectedCount: '已选 {{count}} 项',
    },
  },
  FileParsingStatus: {
    chunks: {
      embeddingStatus: {
        empty: '文本块尚未完全向量化，将导致语义检索功能不可用，为提升检索质量，请对文本块向量化',
        error: '向量化失败',
        errorResult: '向量化失败，请检查后重试。失败原因：',
        processing: '文本块正在向量化，请耐心等待',
        success: '当前文本块均已向量化',
      },
      embeddings: '向量化',
      status: {
        error: '分块失败',
        errorResult: '分块失败，请检查后重试。失败原因：',
        processing: '分块中',
        processingTip: '服务端正在拆分文本块，关闭页面不影响分块进度',
      },
    },
  },
  GoBack: {
    back: '返回',
  },
  MaxTokenSlider: {
    unlimited: '无限制',
  },
  ModelSelect: {
    featureTag: {
      custom: '自定义模型，默认设定同时支持函数调用与视觉识别，请根据实际情况验证上述能力的可用性',
      file: '该模型支持上传文件读取与识别',
      functionCall: '该模型支持函数调用（Function Call）',
      reasoning: '该模型支持深度思考',
      tokens: '该模型单个会话最多支持 {{tokens}} Tokens',
      vision: '该模型支持视觉识别',
    },
    removed: '该模型不在列表中，若取消选中将会自动移除',
  },
  ModelSwitchPanel: {
    emptyModel: '没有启用的模型，请前往设置开启',
    provider: '提供商',
  },
  Thinking: {
    thinking: '深度思考中...',
    thought: '已深度思考（用时 {{duration}} 秒）',
    thoughtWithDuration: '已深度思考',
  },
};
