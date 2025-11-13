import { RunCommandParams } from '@lobechat/electron-client-ipc';
import { BuiltinInterventionProps } from '@lobechat/types';
import { memo } from 'react';

import RunCommand from './RunCommand';

const Intervention = memo<BuiltinInterventionProps<RunCommandParams>>(
  ({ apiName, args, messageId }) => {
    if (apiName === 'runCommand') {
      return <RunCommand {...args} messageId={messageId} />;
    }

    return null;
  },
);

export default Intervention;
