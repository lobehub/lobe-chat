import { Flexbox, Text } from '@lobehub/ui-rn';
import React from 'react';
import { ScrollView } from 'react-native';

import NativePageContainer from '../NativePageContainer';

export default () => {
  return (
    <NativePageContainer autoBack largeTitleEnabled title="示例页面">
      <ScrollView>
        <Flexbox gap={16} padding={16}>
          <Text as="h2">NativePageContainer 示例</Text>
          <Text type="secondary">这是一个使用原生导航栏的页面容器</Text>
          <Text>• 支持自动返回按钮检测</Text>
          <Text>• 支持大标题模式</Text>
          <Text>• 自动适配主题</Text>
        </Flexbox>
      </ScrollView>
    </NativePageContainer>
  );
};
