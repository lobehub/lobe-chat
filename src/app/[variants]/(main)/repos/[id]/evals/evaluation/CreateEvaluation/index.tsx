'use client';

import { Button } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useCreateDatasetModal } from './useModal';

interface CreateEvaluationProps {
  knowledgeBaseId: string;
  onCreate?: () => void;
}

const CreateEvaluation = memo<CreateEvaluationProps>(({ knowledgeBaseId, onCreate }) => {
  const { t } = useTranslation('ragEval');
  const modal = useCreateDatasetModal();
  return (
    <Button
      onClick={() => {
        modal.open({ knowledgeBaseId, onCreate });
      }}
      type={'primary'}
    >
      {t('evaluation.addNewButton')}
    </Button>
  );
});
export default CreateEvaluation;
