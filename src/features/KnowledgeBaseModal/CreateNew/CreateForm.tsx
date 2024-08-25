import { Button, Form, Input } from 'antd';
import { css, cx } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useKnowledgeBaseStore } from '@/store/knowledgeBase';
import { CreateKnowledgeBaseParams } from '@/types/knowledgeBase';

const formItem = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .ant-form-item {
    margin-block-end: 0;
  }
`;

interface CreateFormProps {
  onClose?: () => void;
}

const CreateForm = memo<CreateFormProps>(({ onClose }) => {
  const { t } = useTranslation('knowledgeBase');
  const [loading, setLoading] = useState(false);
  const createNewKnowledgeBase = useKnowledgeBaseStore((s) => s.createNewKnowledgeBase);

  const onFinish = async (values: CreateKnowledgeBaseParams) => {
    setLoading(true);

    try {
      await createNewKnowledgeBase(values);
      setLoading(false);
      onClose?.();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <Flexbox gap={8}>
      <div>{t('createNew.formTitle')}</div>
      <Form className={cx(formItem)} onFinish={onFinish}>
        <Form.Item
          name={'name'}
          rules={[{ message: t('createNew.name.required'), required: true }]}
        >
          <Input autoFocus placeholder={t('createNew.name.placeholder')} variant={'filled'} />
        </Form.Item>
        <Form.Item name={'description'}>
          <Input.TextArea
            placeholder={t('createNew.description.placeholder')}
            style={{ minHeight: 120 }}
            variant={'filled'}
          />
        </Form.Item>
        <Button
          block
          htmlType={'submit'}
          loading={loading}
          style={{ marginTop: 16 }}
          type={'primary'}
        >
          {t('createNew.confirm')}
        </Button>
      </Form>
    </Flexbox>
  );
});

export default CreateForm;
