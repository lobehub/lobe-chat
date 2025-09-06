import React, { memo } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { ModelIcon } from '@lobehub/icons-rn';

import { useCurrentAgent } from '@/hooks/useCurrentAgent';
import { useStyles } from './styles';
import { ICON_SIZE } from '@/const/common';

interface ModelSwitchButtonProps {
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * 模型切换按钮组件
 * 显示当前选中的模型图标，点击后可以切换模型
 */
const ModelSwitchButton = memo<ModelSwitchButtonProps>(({ onPress, style }) => {
  const { currentModel } = useCurrentAgent();
  const { styles } = useStyles();

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[styles.button, style]}>
      <ModelIcon model={currentModel} size={ICON_SIZE} />
    </TouchableOpacity>
  );
});

ModelSwitchButton.displayName = 'ModelSwitchButton';

export default ModelSwitchButton;
