'use client';

import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, Select, Space } from 'antd';
import { Flexbox } from 'react-layout-kit';

const { RangePicker } = DatePicker;

interface PACSQueryFormValues {
  patientName?: string;
  patientId?: string;
  dateRange?: [any, any];
  examType?: string;
}

const PACSQueryForm = () => {
  const [form] = Form.useForm<PACSQueryFormValues>();

  const handleSearch = (values: PACSQueryFormValues) => {
    console.log('PACS Query:', values);
    // TODO: Implement PACS query logic
  };

  const handleClear = () => {
    form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSearch}
    >
      <Flexbox gap={16}>
        <Flexbox horizontal gap={16}>
          <Form.Item
            label="Patient Name"
            name="patientName"
            style={{ flex: 1, marginBottom: 0 }}
          >
            <Input placeholder="Enter patient name" />
          </Form.Item>

          <Form.Item
            label="Patient ID"
            name="patientId"
            style={{ flex: 1, marginBottom: 0 }}
          >
            <Input placeholder="Enter patient ID" />
          </Form.Item>
        </Flexbox>

        <Flexbox horizontal gap={16}>
          <Form.Item
            label="Date Range"
            name="dateRange"
            style={{ flex: 1, marginBottom: 0 }}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Exam Type"
            name="examType"
            style={{ flex: 1, marginBottom: 0 }}
          >
            <Select
              placeholder="Select exam type"
              allowClear
              options={[
                { label: 'All', value: '' },
                { label: 'IRM (MRI)', value: 'IRM' },
                { label: 'TDM (CT)', value: 'TDM' },
                { label: 'Échographie (Ultrasound)', value: 'ECHO' },
                { label: 'Radiographie (X-Ray)', value: 'XR' },
              ]}
            />
          </Form.Item>
        </Flexbox>

        <Flexbox horizontal gap={8} justify="flex-end">
          <Button onClick={handleClear} icon={<ClearOutlined />}>
            Clear
          </Button>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            Search PACS
          </Button>
        </Flexbox>
      </Flexbox>
    </Form>
  );
};

export default PACSQueryForm;
