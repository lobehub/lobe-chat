import { Switch } from 'antd';
import { memo } from 'react';

interface ContextCachingSwitchProps {
  onChange?: (value: boolean) => void;
  value?: boolean;
}

const ContextCachingSwitch = memo<ContextCachingSwitchProps>(({ value, onChange }) => {
  return (
    <Switch
      onChange={(checked) => {
        onChange?.(!checked);
      }}
      value={!value}
    />
  );
});

export default ContextCachingSwitch;
