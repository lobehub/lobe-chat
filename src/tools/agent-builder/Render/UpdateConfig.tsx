import { BuiltinRenderProps } from '@lobechat/types';
import { memo } from 'react';

import type { UpdateAgentConfigParams, UpdateConfigState } from '../types';
import ConfigDiffView from './components/ConfigDiffView';

const UpdateConfig = memo<BuiltinRenderProps<UpdateAgentConfigParams, UpdateConfigState>>(
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

export default UpdateConfig;
