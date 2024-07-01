import { Highlighter } from '@lobehub/ui';
import { memo } from 'react';

import { useYamlArguments } from '@/hooks/useYamlArguments';

export interface ArgumentsProps {
  arguments?: string;
}

const Arguments = memo<ArgumentsProps>(({ arguments: args = '' }) => {
  const yaml = useYamlArguments(args);

  return (
    !!yaml && (
      <Highlighter language={'yaml'} showLanguage={false}>
        {yaml}
      </Highlighter>
    )
  );
});

export default Arguments;
