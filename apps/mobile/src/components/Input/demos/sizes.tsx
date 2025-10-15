import { Flexbox, Input } from '@lobehub/ui-rn';

const SizesDemo = () => {
  return (
    <Flexbox gap={16}>
      <Input placeholder="Small" size="small" />
      <Input placeholder="Middle (默认)" size="middle" />
      <Input placeholder="Large" size="large" />

      <Input.Search placeholder="Small Search" size="small" />
      <Input.Search placeholder="Middle Search" size="middle" />
      <Input.Search placeholder="Large Search" size="large" />

      <Input.Password placeholder="Small Password" size="small" />
      <Input.Password placeholder="Middle Password" size="middle" />
      <Input.Password placeholder="Large Password" size="large" />
    </Flexbox>
  );
};

export default SizesDemo;
