'use client';

import { Flexbox } from 'react-layout-kit';

import Loading from '@/components/Loading/BrandTextLoading';
import { useKnowledgeBaseStore } from '@/store/knowledgeBase';

import EmptyGuide from './EmptyGuide';
import EvaluationList from './EvaluationList';

interface Params {
  id: string;
}

type Props = { params: Params & Promise<Params> };

const Evaluation = ({ params }: Props) => {
  const knowledgeBaseId = params.id;

  const useFetchEvaluation = useKnowledgeBaseStore((s) => s.useFetchEvaluationList);

  const { data, isLoading } = useFetchEvaluation(knowledgeBaseId);

  const isEmpty = data?.length === 0;

  return isLoading ? (
    <Loading />
  ) : isEmpty ? (
    <EmptyGuide knowledgeBaseId={knowledgeBaseId} />
  ) : (
    <Flexbox height={'100%'}>
      <EvaluationList knowledgeBaseId={knowledgeBaseId} />
    </Flexbox>
  );
};

export default Evaluation;
