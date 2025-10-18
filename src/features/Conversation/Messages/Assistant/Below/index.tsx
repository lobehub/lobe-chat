import { ChatMessageExtra } from '@lobechat/types';
import { memo } from 'react';

import { AutoSuggestions } from './AutoSuggestions';

interface BelowProps {
  extra?: ChatMessageExtra;
  id: string;
}
const Below = memo<BelowProps>(({ extra = {}, id }) => {
  return (
    extra && (
      <div>{extra.autoSuggestions && <AutoSuggestions id={id} {...extra.autoSuggestions} />}</div>
    )
  );
});

export default Below;
