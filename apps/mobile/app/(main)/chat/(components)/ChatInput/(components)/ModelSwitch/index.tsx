import React, { memo, useState, useCallback } from 'react';
import { ViewStyle } from 'react-native';

import ModelSwitchButton from './ModelSwitchButton';
import ModelSelectModal from './ModelSelectModal';

interface ModelSwitchProps {
  style?: ViewStyle;
}

/**
 * 模型切换组合组件
 * 包含切换按钮和选择模态框，管理状态
 */
const ModelSwitch = memo<ModelSwitchProps>(({ style }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  return (
    <>
      <ModelSwitchButton onPress={handleOpenModal} style={style} />

      <ModelSelectModal onClose={handleCloseModal} visible={modalVisible} />
    </>
  );
});

ModelSwitch.displayName = 'ModelSwitch';

export default ModelSwitch;
