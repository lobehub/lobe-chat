import { Icon } from '@lobehub/ui';
import { SheetIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { createModal } from '@/components/FunctionModal';

import CreateForm from './CreateForm';

const Title = () => {
  const { t } = useTranslation('ragEval');

  return (
    <Flexbox gap={8} horizontal>
      <Icon icon={SheetIcon} />
      {t('addDataset.title')}
    </Flexbox>
  );
};

interface CreateDatasetModalProps {
  knowledgeBaseId: string;
}

export const useCreateDatasetModal = createModal<CreateDatasetModalProps>((instance, params) => ({
  content: (
    <Flexbox paddingInline={16} style={{ marginBlock: 24 }}>
      <CreateForm
        knowledgeBaseId={params!.knowledgeBaseId}
        onClose={() => {
          instance.current?.destroy();
        }}
      />
    </Flexbox>
  ),
  title: <Title />,
}));
