import { Skeleton } from 'antd';
import { Flexbox } from 'react-layout-kit';

export default function Loading() {
  return (
    <Flexbox gap={24} style={{ margin: '0 auto', maxWidth: 800, padding: 24 }}>
      <Flexbox gap={8}>
        <Skeleton.Input style={{ height: 32, width: 200 }} />
        <Skeleton.Input style={{ height: 20, width: 300 }} />
      </Flexbox>

      <Skeleton.Input style={{ height: 80, width: '100%' }} />
      <Skeleton.Input style={{ height: 400, width: '100%' }} />
      <Skeleton.Input style={{ height: 400, width: '100%' }} />
    </Flexbox>
  );
}
