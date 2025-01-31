import { FormModal, Icon } from '@lobehub/ui';
import type { FormItemProps } from '@lobehub/ui/es/Form/components/FormItem';
import { App, Button, Input } from 'antd';
import { BrainIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAiInfraStore } from '@/store/aiInfra/store';
import { AiProviderDetailItem, UpdateAiProviderParams } from '@/types/aiProvider';

interface CreateNewProviderProps {
  id: string;
  initialValues: AiProviderDetailItem;
  onClose?: () => void;
  open?: boolean;
}

const CreateNewProvider = memo<CreateNewProviderProps>(({ onClose, open, initialValues, id }) => {
  const { t } = useTranslation(['modelProvider', 'common']);
  const [loading, setLoading] = useState(false);
  const [updateAiProvider, deleteAiProvider] = useAiInfraStore((s) => [
    s.updateAiProvider,
    s.deleteAiProvider,
  ]);

  const { message, modal } = App.useApp();
  const router = useRouter();

  const onFinish = async (values: UpdateAiProviderParams) => {
    setLoading(true);

    try {
      await updateAiProvider(id, values);
      setLoading(false);
      message.success(t('updateAiProvider.updateSuccess'));
      onClose?.();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const basicItems: FormItemProps[] = [
    {
      children: initialValues.id,
      label: t('createNewAiProvider.id.title'),
      minWidth: 400,
      rules: [{ message: t('createNewAiProvider.id.required'), required: true }],
    },
    {
      children: (
        <Input placeholder={t('createNewAiProvider.name.placeholder')} variant={'filled'} />
      ),
      label: t('createNewAiProvider.name.title'),
      minWidth: 400,
      name: 'name',
      rules: [{ message: t('createNewAiProvider.name.required'), required: true }],
    },
    {
      children: (
        <Input.TextArea
          placeholder={t('createNewAiProvider.description.placeholder')}
          style={{ minHeight: 80 }}
          variant={'filled'}
        />
      ),
      label: t('createNewAiProvider.description.title'),
      minWidth: 400,
      name: 'description',
    },
    {
      children: <Input allowClear placeholder={'https://logo-url'} variant={'filled'} />,
      label: t('createNewAiProvider.logo.title'),
      minWidth: 400,
      name: 'logo',
    },
  ];

  return (
    <FormModal
      footer={
        <Flexbox horizontal justify={'space-between'}>
          <Button
            danger
            disabled={loading}
            onClick={() => {
              modal.confirm({
                okButtonProps: {
                  danger: true,
                },
                okText: t('delete', { ns: 'common' }),
                onOk: async () => {
                  await deleteAiProvider(id);
                  router.push('/settings/provider');

                  onClose?.();
                  message.success(t('updateAiProvider.deleteSuccess'));
                },
                title: t('updateAiProvider.confirmDelete'),
              });
            }}
            type={'primary'}
          >
            {t('delete', { ns: 'common' })}
          </Button>
          <Flexbox gap={8} horizontal>
            <Button htmlType={'submit'} loading={loading} type={'primary'}>
              {t('update', { ns: 'common' })}
            </Button>
          </Flexbox>
        </Flexbox>
      }
      initialValues={initialValues}
      items={[
        {
          children: basicItems,
          title: t('createNewAiProvider.basicTitle'),
        },
      ]}
      onCancel={onClose}
      onFinish={onFinish}
      open={open}
      scrollToFirstError={{ behavior: 'instant', block: 'end', focus: true }}
      submitText={t('createNewAiProvider.confirm')}
      title={
        <Flexbox gap={8} horizontal>
          <Icon icon={BrainIcon} />
          {t('createNewAiProvider.title')}
        </Flexbox>
      }
    />
  );
});

export default CreateNewProvider;
