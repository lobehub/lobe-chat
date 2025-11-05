import { Alert, Flexbox } from '@lobehub/ui-rn';

const BasicDemo = () => {
  return (
    <Flexbox gap={16}>
      <Alert
        description="支持额外的描述信息，用于说明当前的系统状态或指导用户后续操作。"
        message="带描述的提示"
      />
      <Alert message="带描述的提示" />
      <Alert message="带描述的提示" variant={'filled'} />
      <Alert message="带描述的提示" variant={'borderless'} />
      <Alert message="带描述的提示" variant={'outlined'} />
    </Flexbox>
  );
};

export default BasicDemo;
