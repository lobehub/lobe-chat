import { MaterialFileTypeIcon } from '@lobehub/ui';
import { App, Button, Form, Select } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import RepoIcon from '@/components/RepoIcon';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

const useStyles = createStyles(({ css, token }) => ({
  files: css`
    height: 48px;
    padding-block: 4px;
    padding-inline: 8px;
    border: 1px solid ${token.colorSplit};
    border-radius: 6px;
  `,
  formItem: css`
    display: flex;
    flex-direction: column;
    gap: 12px;

    .ant-form-item {
      margin-block-end: 0;
    }
  `,
}));

interface CreateFormProps {
  fileIds: string[];
  knowledgeBaseId?: string;
  onClose?: () => void;
}

const SelectForm = memo<CreateFormProps>(({ onClose, knowledgeBaseId, fileIds }) => {
  const { t } = useTranslation('knowledgeBase');
  const { styles } = useStyles();
  const [loading, setLoading] = useState(false);

  const { message } = App.useApp();
  const [useFetchKnowledgeBaseList, addFilesToKnowledgeBase] = useKnowledgeBaseStore((s) => [
    s.useFetchKnowledgeBaseList,
    s.addFilesToKnowledgeBase,
  ]);
  const { data, isLoading } = useFetchKnowledgeBaseList();
  const onFinish = async (values: { id: string }) => {
    setLoading(true);

    try {
      await addFilesToKnowledgeBase(values.id, fileIds);
      setLoading(false);
      message.success({
        content: (
          <Trans i18nKey={'addToKnowledgeBase.addSuccess'} ns={'knowledgeBase'}>
            文件添加成功，<Link href={`/repos/${values.id}`}>立即查看</Link>
          </Trans>
        ),
      });

      onClose?.();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <Flexbox gap={24}>
      <Flexbox align={'center'} className={styles.files} gap={8} horizontal>
        <MaterialFileTypeIcon filename={''} size={32} />
        {t('addToKnowledgeBase.totalFiles', { count: fileIds.length })}
      </Flexbox>
      <Form className={styles.formItem} layout={'vertical'} onFinish={onFinish}>
        <Form.Item
          label={t('addToKnowledgeBase.id.title')}
          name={'id'}
          required={false}
          rules={[{ message: t('addToKnowledgeBase.id.required'), required: true }]}
        >
          <Select
            autoFocus
            loading={isLoading}
            options={(data || [])
              .filter((item) => item.id !== knowledgeBaseId)
              .map((item) => ({
                label: (
                  <Flexbox gap={8} horizontal>
                    <RepoIcon />
                    {item.name}
                  </Flexbox>
                ),
                value: item.id,
              }))}
            placeholder={t('addToKnowledgeBase.id.placeholder')}
          />
        </Form.Item>

        <Button
          block
          htmlType={'submit'}
          loading={loading}
          style={{ marginTop: 16 }}
          type={'primary'}
        >
          {t('addToKnowledgeBase.confirm')}
        </Button>
      </Form>
    </Flexbox>
  );
});

export default SelectForm;
