import { Button, Form, Input } from 'antd';
import { css, cx } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useKnowledgeBaseStore } from '@/store/knowledgeBase';
import { CreateNewEvalDatasets } from '@/types/eval';

const formItem = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .ant-form-item {
    margin-block-end: 0;
  }
`;

interface CreateFormProps {
  knowledgeBaseId: string;
  onClose?: () => void;
}

const CreateForm = memo<CreateFormProps>(({ onClose, knowledgeBaseId }) => {
  const { t } = useTranslation('ragEval');
  const [loading, setLoading] = useState(false);
  const createNewDataset = useKnowledgeBaseStore((s) => s.createNewDataset);

  const onFinish = async (values: CreateNewEvalDatasets) => {
    setLoading(true);

    try {
      await createNewDataset({ ...values, knowledgeBaseId });
      setLoading(false);
      onClose?.();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <Flexbox gap={8}>
      <Form className={cx(formItem)} onFinish={onFinish}>
        <Form.Item
          name={'name'}
          rules={[{ message: t('addDataset.name.required'), required: true }]}
        >
          <Input autoFocus placeholder={t('addDataset.name.placeholder')} />
        </Form.Item>
        <Form.Item name={'description'}>
          <Input.TextArea
            placeholder={t('addDataset.description.placeholder')}
            style={{ minHeight: 120 }}
          />
        </Form.Item>
        <Button
          block
          htmlType={'submit'}
          loading={loading}
          style={{ marginTop: 16 }}
          type={'primary'}
        >
          {t('addDataset.confirm')}
        </Button>
      </Form>
    </Flexbox>
  );
});

export default CreateForm;
