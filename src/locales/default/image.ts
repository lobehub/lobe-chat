export const image = {
  config: {
    title: 'AI 绘画',
    model: {
      label: '模型',
    },
    prompt: {
      placeholder: '描述你想要生成的内容',
    },
    width: {
      label: '宽度',
    },
    height: {
      label: '高度',
    },
    size: {
      label: '尺寸',
    },
    aspectRatio: {
      label: '比例',
    },
    steps: {
      label: '步数',
    },
    seed: {
      label: '种子',
    },
  },
  topic: {
    createNew: '新建主题',
    untitled: '默认主题',
    empty: '暂无生成主题',
    deleteConfirm: '删除生成主题',
    deleteConfirmDesc: '即将删除该生成主题，删除后将不可恢复，请谨慎操作。',
  },
} as const;
