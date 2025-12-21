import { ToolIntervention } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import { LOADING_FLAT } from '@/const/message';

import StatusIndicator from './StatusIndicator';
import ToolTitle from './ToolTitle';

interface InspectorProps {
  apiName: string;
  identifier: string;
  intervention?: ToolIntervention;
  result?: { content: string | null; error?: any; state?: any };
}

const Inspectors = memo<InspectorProps>(({ identifier, apiName, result, intervention }) => {
  const hasError = !!result?.error;
  const hasSuccessResult = !!result?.content && result.content !== LOADING_FLAT;
  const hasResult = hasSuccessResult || hasError;

  const isPending = intervention?.status === 'pending';
  const isTitleLoading = !hasResult && !isPending;

  return (
    <Flexbox align={'center'} gap={6} horizontal>
      <StatusIndicator intervention={intervention} result={result} />
      <ToolTitle apiName={apiName} identifier={identifier} isLoading={isTitleLoading} />
    </Flexbox>
  );
});

export default Inspectors;
