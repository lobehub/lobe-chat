import { Button, Flexbox, FullWindowOverlay, LoadingToast, Text } from '@lobehub/ui-rn';
import React, { useState } from 'react';

export default () => {
  const [visible, setVisible] = useState(false);

  const handleStart = () => {
    setVisible(true);
    // 模拟异步操作
    setTimeout(() => {
      setVisible(false);
    }, 5000);
  };

  return (
    <Flexbox gap={16}>
      <Text type="secondary">点击按钮显示加载浮层，5秒后自动关闭</Text>
      <Button onPress={handleStart} type="primary">
        开始加载
      </Button>

      {visible && (
        <FullWindowOverlay>
          <LoadingToast />
        </FullWindowOverlay>
      )}
    </Flexbox>
  );
};
