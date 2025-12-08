import { BuiltinRenderProps } from '@lobechat/types';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { UpdateAgentConfigParams, UpdateConfigState } from '../types';
import ConfigDiffView from './components/ConfigDiffView';

const UpdateConfig = memo<BuiltinRenderProps<UpdateAgentConfigParams, UpdateConfigState>>(
  ({ pluginState }) => {
    const { config, meta } = pluginState || {};

    const hasConfig = config && config.updatedFields.length > 0;
    const hasMeta = meta && meta.updatedFields.length > 0;

    if (!hasConfig && !hasMeta) {
      return null;
    }

    return (
      <Flexbox gap={8}>
        {hasConfig && (
          <ConfigDiffView
            newValues={config.newValues}
            previousValues={config.previousValues}
            updatedFields={config.updatedFields}
          />
        )}
        {hasMeta && (
          <ConfigDiffView
            newValues={meta.newValues}
            previousValues={meta.previousValues}
            updatedFields={meta.updatedFields}
          />
        )}
      </Flexbox>
    );
  },
);

export default UpdateConfig;
