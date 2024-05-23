export default {
  ModelSelect: {
    featureTag: {
      custom: '自定义模型，默认设定同时支持函数调用与视觉识别，请根据实际情况验证上述能力的可用性',
      file: '该模型支持上传文件读取与识别',
      functionCall: '该模型支持函数调用（Function Call）',
      tokens: '该模型单个会话最多支持 {{tokens}} Tokens',
      vision: '该模型支持视觉识别',
    },
    removed: '该模型不在列表中，若取消选中将会自动移除',
  },
  ModelSwitchPanel: {
    emptyModel: '没有启用的模型，请前往设置开启',
    provider: '提供商',
  },
};
