import { Icon } from '@lobehub/ui';
import { BookUp2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { createModal } from '@/components/FunctionModal';

import SelectForm from './SelectForm';

const Title = () => {
  const { t } = useTranslation('knowledgeBase');

  return (
    <Flexbox gap={8} horizontal>
      <Icon icon={BookUp2Icon} />
      {t('addToKnowledgeBase.title')}
    </Flexbox>
  );
};

interface AddFilesToKnowledgeBaseModalProps {
  fileIds: string[];
  knowledgeBaseId?: string;
  onClose?: () => void;
}

export const useAddFilesToKnowledgeBaseModal = createModal<AddFilesToKnowledgeBaseModalProps>(
  (instance, params) => ({
    content: (
      <Flexbox padding={16}>
        <SelectForm
          fileIds={params?.fileIds || []}
          knowledgeBaseId={params?.knowledgeBaseId}
          onClose={() => {
            instance.current?.destroy();
            params?.onClose?.();
          }}
        />
      </Flexbox>
    ),
    title: <Title />,
  }),
);
