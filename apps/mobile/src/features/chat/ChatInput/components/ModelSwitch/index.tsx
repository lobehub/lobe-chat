import { ModelIcon } from '@lobehub/icons-rn';
import React, { memo, useCallback, useState } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

import { ICON_SIZE_LARGE } from '@/const/common';
import { useCurrentAgent } from '@/hooks/useCurrentAgent';

import ModelSelectModal from './ModelSelectModal';

interface ModelSwitchProps {
  style?: ViewStyle;
}

/**
 * 模型切换组合组件
 * 包含切换按钮和选择模态框，管理状态
 */
const ModelSwitch = memo<ModelSwitchProps>(() => {
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
      <TouchableOpacity onPress={handleOpenModal}>
        <ModelIcon model={currentModel} size={ICON_SIZE_LARGE} />
      </TouchableOpacity>

      <ModelSelectModal onClose={handleCloseModal} visible={modalVisible} />
    </>
  );
});

ModelSwitch.displayName = 'ModelSwitch';

export default ModelSwitch;
