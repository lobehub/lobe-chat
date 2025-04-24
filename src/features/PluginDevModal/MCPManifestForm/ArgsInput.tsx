import { Input, InputProps } from 'antd';
import { memo } from 'react';

interface ArgsInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  onChange?: (value: string[]) => void;
  value?: string[];
}

const ArgsInput = memo<ArgsInputProps>(({ value, onChange, ...res }) => {
  return (
    <Input
      onChange={(e) => {
        onChange?.([e.target.value]);
      }}
      value={value?.join(' ')}
      {...res}
    />
  );
});
export default ArgsInput;
