import { BuiltinRenderProps } from '@lobechat/types';
import { memo } from 'react';

import type { UpdateChatConfigParams, UpdateConfigState } from '../types';
import ConfigDiffView from './components/ConfigDiffView';

const UpdateChatConfig = memo<BuiltinRenderProps<UpdateChatConfigParams, UpdateConfigState>>(
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

export default UpdateChatConfig;
