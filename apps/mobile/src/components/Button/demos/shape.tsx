import { Button, Space } from '@lobehub/ui-rn';
import { ArrowUp, Plus, Search } from 'lucide-react-native';

const ShapeDemo = () => {
  return (
    <Space size={[8, 16]} wrap>
      <Button icon={<Search />} shape="circle" size="small" type="default" />
      <Button icon={<Plus />} shape="circle" size="middle" type="dashed" />
      <Button icon={<ArrowUp />} shape="circle" size="large" type="primary" />
    </Space>
  );
};

export default ShapeDemo;
