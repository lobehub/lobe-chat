import { Divider } from 'antd';
import { Flexbox } from 'react-layout-kit';

import ConfigPanel from '@/app/[variants]/(main)/image/features/ConfigPanel';
import ImageWorkspace from '@/app/[variants]/(main)/image/features/ImageWorkspace';
import Topics from '@/app/[variants]/(main)/image/features/Topics';
import InitClientDB from '@/features/InitClientDB';

import TopicUrlSync from './features/Topics/TopicUrlSync';

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
      <TopicUrlSync />

      {/* 左侧配置面板 */}
      <ConfigPanel />

      <Divider style={{ height: '100%', margin: 0 }} type="vertical" />

      {/* 中间内容区域 */}
      <ImageWorkspace />

      <Divider style={{ height: '100%', margin: 0 }} type="vertical" />

      {/* 右侧Topics列表 */}
      <Topics />
    </Flexbox>
  );
}
