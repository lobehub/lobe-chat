import { CreateNewEvalEvaluation } from '@lobechat/types';
import { Button, Form, Input, Select, TextArea } from '@lobehub/ui';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

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
    <Form
      footer={
        <Button block htmlType={'submit'} loading={loading} type={'primary'}>
          {t('evaluation.addEvaluation.confirm')}
        </Button>
      }
      gap={16}
      items={[
        {
          children: (
            <Input autoFocus placeholder={t('evaluation.addEvaluation.name.placeholder')} />
          ),
          label: t('evaluation.addEvaluation.name.placeholder'),
          name: 'name',
          rules: [{ message: t('evaluation.addEvaluation.name.required'), required: true }],
        },
        {
          children: (
            <TextArea
              placeholder={t('evaluation.addEvaluation.description.placeholder')}
              style={{ minHeight: 120 }}
            />
          ),
          label: t('evaluation.addEvaluation.description.placeholder'),
          name: 'description',
        },
        {
          children: (
            <Select
              loading={isLoading}
              options={data?.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              placeholder={t('evaluation.addEvaluation.datasetId.placeholder')}
            />
          ),
          label: t('evaluation.addEvaluation.datasetId.placeholder'),
          name: 'datasetId',
          rules: [{ message: t('evaluation.addEvaluation.datasetId.required'), required: true }],
        },
      ]}
      itemsType={'flat'}
      layout={'vertical'}
      onFinish={onFinish}
    />
  );
});

export default CreateForm;
