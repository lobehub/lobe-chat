import { ModelIcon } from '@lobehub/icons';
import { SortableList } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { AiProviderModelListItem } from '../../../../../../../../../packages/model-bank/src/types/aiModel';

const ListItem = memo<AiProviderModelListItem>(({ id, displayName }) => {
  return (
    <>
      <Flexbox gap={8} horizontal>
        <ModelIcon model={id} size={24} type={'avatar'} />
        {displayName || id}
      </Flexbox>
      <SortableList.DragHandle />
    </>
  );
});

export default ListItem;
