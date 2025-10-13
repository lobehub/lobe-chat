import { Button, Input, Text } from '@lobehub/ui-rn';
import React, { useState } from 'react';
import { View } from 'react-native';

import Form, { FormValues } from '..';

const UseFormDemo = () => {
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  return (
    <View style={{ width: '100%' }}>
      <Form
        form={form}
        initialValues={{ username: 'lobe' }}
        onFinish={(values) => setSubmitted(values)}
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[{ message: '用户名不能为空', required: true }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>
      </Form>
      <Button block onPress={() => form.submit()} style={{ marginTop: 16 }} type="primary">
        提交
      </Button>
      {submitted && (
        <Text style={{ marginTop: 12 }}>{`提交结果：${(submitted.username as string) || ''}`}</Text>
      )}
    </View>
  );
};

export default UseFormDemo;
