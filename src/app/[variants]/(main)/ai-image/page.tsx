'use client';

import { Divider } from 'antd';
import { Flexbox } from 'react-layout-kit';

import ConfigPanel from '@/app/[variants]/(main)/ai-image/features/ConfigPanel';
import GenerationFeed from '@/app/[variants]/(main)/ai-image/features/GenerationFeed';
import PromptInput from '@/app/[variants]/(main)/ai-image/features/PromptInput';
import TopicsList from '@/app/[variants]/(main)/ai-image/features/TopicsList';

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
      {/* 左侧配置面板 */}
      <ConfigPanel />

      <Divider style={{ height: '100%', margin: 0 }} type="vertical" />

      {/* 中间内容区域 */}
      <Flexbox flex={1} height="100%">
        {/* 生成结果展示区 */}
        <Flexbox flex={1} padding={24} style={{ overflowY: 'auto' }}>
          <GenerationFeed />
        </Flexbox>

        <Divider style={{ margin: 0 }} />

        {/* 底部输入框 */}
        <Flexbox padding="16px 24px">
          <PromptInput />
        </Flexbox>
      </Flexbox>

      <Divider style={{ height: '100%', margin: 0 }} type="vertical" />

      {/* 右侧Topics列表 */}
      <TopicsList />
    </Flexbox>
  );
}
