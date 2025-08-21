import { CreateNewEvalDatasets } from '@lobechat/types';
import { Button, Form, Input } from '@lobehub/ui';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

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
    <Form
      footer={
        <Button block htmlType={'submit'} loading={loading} type={'primary'}>
          {t('addDataset.confirm')}
        </Button>
      }
      gap={16}
      items={[
        {
          children: <Input autoFocus placeholder={t('addDataset.name.placeholder')} />,
          label: t('addDataset.name.placeholder'),
          name: 'name',
          rules: [{ message: t('addDataset.name.required'), required: true }],
        },
        {
          children: <Input placeholder={t('addDataset.description.placeholder')} />,
          label: t('addDataset.description.placeholder'),
          name: 'description',
        },
      ]}
      itemsType={'flat'}
      layout={'vertical'}
      onFinish={onFinish}
    />
  );
});

export default CreateForm;
