'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import CreateEvaluationButton from '../CreateEvaluation';

interface EmptyGuideProps {
  knowledgeBaseId: string;
}

const EmptyGuide = memo<EmptyGuideProps>(({ knowledgeBaseId }) => {
  const { t } = useTranslation('ragEval');

  return (
    <Center gap={24} height={'100%'} width={'100%'}>
      <div>{t('evaluation.emptyGuide')}</div>
      <Flexbox gap={8} horizontal>
        <CreateEvaluationButton knowledgeBaseId={knowledgeBaseId} />
      </Flexbox>
    </Center>
  );
});
export default EmptyGuide;
