import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { BuiltinToolsRenders } from '@/tools/renders';

import Loading from '../Loading';
import { useParseContent } from '../useParseContent';

export interface BuiltinTypeProps {
  content: string;
  id: string;
  identifier?: string;
  loading?: boolean;
}

const BuiltinType = memo<BuiltinTypeProps>(({ content, id, identifier, loading }) => {
  const { isJSON, data } = useParseContent(content);

  if (!isJSON) {
    return (
      loading && (
        <Flexbox gap={8}>
          <Loading />
        </Flexbox>
      )
    );
  }

  const Render = BuiltinToolsRenders[identifier || ''];

  if (!Render) return;

  return <Render content={data} identifier={identifier} messageId={id} />;
});

export default BuiltinType;
