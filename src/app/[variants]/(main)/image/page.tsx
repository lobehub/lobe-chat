import { Divider } from 'antd';
import { Center, Flexbox } from 'react-layout-kit';

import ConfigPanel from '@/app/[variants]/(main)/image/features/ConfigPanel';
import GenerationFeed from '@/app/[variants]/(main)/image/features/GenerationFeed';
import PromptInput from '@/app/[variants]/(main)/image/features/PromptInput';
import Topics from '@/app/[variants]/(main)/image/features/Topics';
import InitClientDB from '@/features/InitClientDB';

export default function AiImage() {
  return (
    <Flexbox
      align="flex-start"
      horizontal
      style={{
        height: '100vh',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <InitClientDB bottom={100} />

      {/* 左侧配置面板 */}
      <ConfigPanel />

      <Divider style={{ height: '100%', margin: 0 }} type="vertical" />

      {/* 中间内容区域 */}
      <Flexbox flex={1} height="100%">
        {/* 生成结果展示区 */}
        <Flexbox flex={1} padding={24} style={{ overflowY: 'auto' }}>
          <GenerationFeed />
        </Flexbox>

        {/* 底部输入框 */}
        <Center style={{ marginBottom: 64 }}>
          <PromptInput />
        </Center>
      </Flexbox>

      <Divider style={{ height: '100%', margin: 0 }} type="vertical" />

      {/* 右侧Topics列表 */}
      <Topics />
    </Flexbox>
  );
}
