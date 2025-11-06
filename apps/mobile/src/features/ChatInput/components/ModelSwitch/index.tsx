import { ModelIcon } from '@lobehub/icons-rn';
import { memo, useCallback, useState } from 'react';
import { type PressableProps, TouchableOpacity, ViewStyle } from 'react-native';

import { ICON_SIZE_LARGE } from '@/_const/common';
import { useCurrentAgent } from '@/hooks/useCurrentAgent';

import ModelSelectModal from './ModelSelectModal';

interface ModelSwitchProps {
  onPress?: PressableProps['onPress'];
  style?: ViewStyle;
}

/**
 * 模型切换组合组件
 * 包含切换按钮和选择模态框，管理状态
 */
const ModelSwitch = memo<ModelSwitchProps>(({ onPress, style }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { currentModel } = useCurrentAgent();

  const handleOpenModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  return (
    <>
      <TouchableOpacity
        onPress={(e) => {
          onPress?.(e);
          handleOpenModal();
        }}
      >
        <ModelIcon model={currentModel} size={ICON_SIZE_LARGE} style={style} />
      </TouchableOpacity>

      <ModelSelectModal onClose={handleCloseModal} visible={modalVisible} />
    </>
  );
});

ModelSwitch.displayName = 'ModelSwitch';

export default ModelSwitch;
