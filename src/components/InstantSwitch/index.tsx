import { Switch, SwitchProps } from 'antd';
import {memo, useEffect, useState} from 'react';

interface InstantSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => Promise<void>;
  size?: SwitchProps['size'];
}

const InstantSwitch = memo<InstantSwitchProps>(({ enabled, onChange, size }) => {
  const [value, setValue] = useState(enabled);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValue(enabled)
  }, [enabled]);

  return (
    <Switch
      checked={value}
      loading={loading}
      onChange={async (enabled) => {
        setLoading(true);
        setValue(enabled);
        await onChange(enabled);
        setLoading(false);
      }}
      size={size}
    />
  );
});

export default InstantSwitch;
