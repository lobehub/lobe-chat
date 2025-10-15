import { Flexbox, Input } from '@lobehub/ui-rn';

const TextAreaDemo = () => {
  return (
    <Flexbox gap={16}>
      <Input.TextArea defaultValue="Auto Size" placeholder="请输入详细描述" />
      <Input.TextArea
        defaultValue="numberOfLines = 2"
        numberOfLines={2}
        placeholder="请输入详细描述"
      />
    </Flexbox>
  );
};

export default TextAreaDemo;
