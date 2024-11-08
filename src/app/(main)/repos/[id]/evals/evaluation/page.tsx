'use client';

import { Flexbox } from 'react-layout-kit';

import CircleLoading from '@/components/CircleLoading';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

import { PageProps } from '../type';
import EmptyGuide from './EmptyGuide';
import EvaluationList from './EvaluationList';

const Evaluation = ({ params }: PageProps) => {
  const knowledgeBaseId = params.id;

  const useFetchEvaluation = useKnowledgeBaseStore((s) => s.useFetchEvaluationList);

  const { data, isLoading } = useFetchEvaluation(knowledgeBaseId);

  const isEmpty = data?.length === 0;

  return isLoading ? (
    <CircleLoading />
  ) : isEmpty ? (
    <EmptyGuide knowledgeBaseId={knowledgeBaseId} />
  ) : (
    <Flexbox height={'100%'}>
      <EvaluationList knowledgeBaseId={knowledgeBaseId} />
    </Flexbox>
  );
};

export default Evaluation;
