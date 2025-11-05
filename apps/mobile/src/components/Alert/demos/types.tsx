import { Alert, Flexbox } from '@lobehub/ui-rn';

const TypesDemo = () => {
  return (
    <Flexbox gap={16}>
      <Alert message="信息提示" type="info" />
      <Alert message="成功提示" type="success" />
      <Alert message="警告提示" type="warning" />
      <Alert message="错误提示" type="error" />
    </Flexbox>
  );
};

export default TypesDemo;
