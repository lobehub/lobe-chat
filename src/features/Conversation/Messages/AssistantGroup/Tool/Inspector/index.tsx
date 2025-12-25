import { type ToolIntervention } from '@lobechat/types';
import { safeParseJSON } from '@lobechat/utils';
import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import { LOADING_FLAT } from '@/const/message';
import { getBuiltinInspector } from '@/tools/inspectors';

import StatusIndicator from './StatusIndicator';
import ToolTitle from './ToolTitle';

interface InspectorProps {
  apiName: string;
  arguments?: string;
  identifier: string;
  intervention?: ToolIntervention;
  result?: { content: string | null; error?: any; state?: any };
}

const Inspectors = memo<InspectorProps>(
  ({ identifier, apiName, arguments: argsStr, result, intervention }) => {
    const hasError = !!result?.error;
    const hasSuccessResult = !!result?.content && result.content !== LOADING_FLAT;
    const hasResult = hasSuccessResult || hasError;

    const isPending = intervention?.status === 'pending';
    const isAborted = intervention?.status === 'aborted';
    const isTitleLoading = !hasResult && !isPending && !isAborted;

    // Check for custom inspector renderer
    const CustomInspector = getBuiltinInspector(identifier, apiName);

    if (CustomInspector) {
      const args = safeParseJSON(argsStr);
      return (
        <Flexbox align={'center'} gap={6} horizontal>
          <StatusIndicator intervention={intervention} result={result} />
          <CustomInspector
            apiName={apiName}
            args={args || {}}
            identifier={identifier}
            isLoading={isTitleLoading}
            pluginState={result?.state}
            result={result}
          />
        </Flexbox>
      );
    }

    return (
      <Flexbox align={'center'} gap={6} horizontal>
        <StatusIndicator intervention={intervention} result={result} />
        <ToolTitle
          apiName={apiName}
          identifier={identifier}
          isAborted={isAborted}
          isLoading={isTitleLoading}
        />
      </Flexbox>
    );
  },
);

export default Inspectors;
