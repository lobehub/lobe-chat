import { Button, Form, Input, Select } from 'antd';
import { css, cx } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useKnowledgeBaseStore } from '@/store/knowledgeBase';
import { CreateNewEvalEvaluation } from '@/types/eval';

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
  onCreate?: () => void;
}

const CreateForm = memo<CreateFormProps>(({ onClose, onCreate, knowledgeBaseId }) => {
  const { t } = useTranslation('ragEval');

  const [loading, setLoading] = useState(false);
  const [useFetchDatasets, createNewEvaluation] = useKnowledgeBaseStore((s) => [
    s.useFetchDatasets,
    s.createNewEvaluation,
  ]);

  const { data, isLoading } = useFetchDatasets(knowledgeBaseId);

  const onFinish = async (values: CreateNewEvalEvaluation) => {
    setLoading(true);

    try {
      await createNewEvaluation({ ...values, knowledgeBaseId });
      setLoading(false);
      onCreate?.();
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
          rules={[{ message: t('evaluation.addEvaluation.name.required'), required: true }]}
        >
          <Input autoFocus placeholder={t('evaluation.addEvaluation.name.placeholder')} />
        </Form.Item>
        <Form.Item name={'description'}>
          <Input.TextArea
            placeholder={t('evaluation.addEvaluation.description.placeholder')}
            style={{ minHeight: 120 }}
          />
        </Form.Item>
        <Form.Item
          name={'datasetId'}
          rules={[{ message: t('evaluation.addEvaluation.datasetId.required'), required: true }]}
        >
          <Select
            loading={isLoading}
            options={data?.map((item) => ({
              label: item.name,
              value: item.id,
            }))}
            placeholder={t('evaluation.addEvaluation.datasetId.placeholder')}
          />
        </Form.Item>
        <Button
          block
          htmlType={'submit'}
          loading={loading}
          style={{ marginTop: 16 }}
          type={'primary'}
        >
          {t('evaluation.addEvaluation.confirm')}
        </Button>
      </Form>
    </Flexbox>
  );
});

export default CreateForm;
