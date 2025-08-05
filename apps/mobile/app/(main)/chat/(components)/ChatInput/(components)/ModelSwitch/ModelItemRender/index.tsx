import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { ModelIcon } from '@lobehub/icons-rn';

import { AIChatModelCard } from '@/types/aiModel';
import { ModelInfoTags } from '@/components';
import { useStyles } from './styles';

interface ModelItemRenderProps extends AIChatModelCard {
  showInfoTag?: boolean;
}

/**
 * 模型项渲染组件
 * 显示模型图标、名称和能力标签，对齐Web端实现
 */
const ModelItemRender = memo<ModelItemRenderProps>(({ showInfoTag = true, ...model }) => {
  const { styles } = useStyles();

  return (
    <View style={styles.container}>
      {/* 左侧：模型图标和名称 */}
      <View style={styles.leftSection}>
        <ModelIcon model={model.id} size={20} />
        <Text numberOfLines={1} style={styles.modelName}>
          {model.displayName || model.id}
        </Text>
      </View>

      {/* 右侧：能力标签（可选） */}
      {showInfoTag && (
        <View style={styles.rightSection}>
          <ModelInfoTags {...model} {...model.abilities} />
        </View>
      )}
    </View>
  );
});

ModelItemRender.displayName = 'ModelItemRender';

export default ModelItemRender;
