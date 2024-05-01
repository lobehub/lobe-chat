import { Skeleton } from 'antd';

export default () => (
  <div style={{ flex: 1 }}>
    <Skeleton paragraph={{ rows: 8 }} title={false} />
  </div>
);
