import { Input } from '@lobehub/ui-rn';

import Form from '..';

const BasicFormDemo = () => (
  <Form initialValues={{ fieldA: '', fieldB: '' }}>
    <Form.Item help="这是一段辅助说明" label="Field A" name="fieldA">
      <Input placeholder="input placeholder" />
    </Form.Item>
    <Form.Item label="Field B" name="fieldB">
      <Input placeholder="input placeholder" />
    </Form.Item>
  </Form>
);

export default BasicFormDemo;
