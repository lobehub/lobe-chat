import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Input } from '@lobehub/ui';
import { Form } from 'antd';
import { SendHorizonal } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';

import { useChatStore } from '@/store/chat';
import { DallEImageItem } from '@/types/tool/dalle';

export interface EditModeProps {
  data: DallEImageItem;
  index: number;
  messageId: string;
  onCancel: () => void;
}

const EditMode = memo<EditModeProps>(({ data, index, messageId, onCancel }) => {
  const { t } = useTranslation('common');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const updateImageItem = useChatStore((s) => s.updateImageItem);
  const generateImageFromPrompts = useChatStore((s) => s.generateImageFromPrompts);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setLoading(true);

    await updateImageItem(messageId, (draft) => {
      draft[index].prompt = values.prompt;
    });

    await generateImageFromPrompts([{ ...data, prompt: values.prompt }], messageId);

    setLoading(false);
    onCancel();
  };

  useHotkeys('enter', handleSubmit, { enableOnFormTags: ['input'] });

  return (
    <div className="flex h-full w-full flex-col gap-2 p-2">
      <Form
        autoComplete="off"
        className="flex-1"
        form={form}
        initialValues={{ prompt: data.prompt }}
      >
        <Form.Item name="prompt" rules={[{ required: true }]}>
          <Input.TextArea
            autoSize={{ maxRows: 8, minRows: 4 }}
            className="h-full"
            placeholder={t('edit')}
          />
        </Form.Item>
      </Form>
      <div className="flex gap-2">
        <Button block onClick={onCancel} type="default">
          {t('cancel')}
        </Button>
        <Button block icon={<SendHorizonal />} loading={loading} onClick={handleSubmit} type="primary">
          {t('regenerate')}
        </Button>
      </div>
    </div>
  );
});

export default EditMode;
