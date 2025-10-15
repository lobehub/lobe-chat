import { memo, useState } from 'react';

import Switch from '../Switch';
import type { InstantSwitchProps } from './type';

const InstantSwitch = memo<InstantSwitchProps>(({ onChange, disabled, loading, ...rest }) => {
  const [toggling, setToggling] = useState(loading);

  return (
    <Switch
      disabled={toggling || disabled}
      onChange={async (v) => {
        setToggling(true);
        await onChange?.(v);
        setToggling(false);
      }}
      {...rest}
    />
  );
});

InstantSwitch.displayName = 'InstantSwitch';

export default InstantSwitch;
