import { BuiltinRenderProps } from '@lobechat/types';
import { memo } from 'react';

import type { UpdateAgentMetaParams, UpdateMetaState } from '../types';
import ConfigDiffView from './components/ConfigDiffView';

const UpdateMeta = memo<BuiltinRenderProps<UpdateAgentMetaParams, UpdateMetaState>>(
  ({ pluginState }) => {
    const { updatedFields = [], previousValues = {}, newValues = {} } = pluginState || {};

    return (
      <ConfigDiffView
        newValues={newValues}
        previousValues={previousValues}
        updatedFields={updatedFields}
      />
    );
  },
);

export default UpdateMeta;
