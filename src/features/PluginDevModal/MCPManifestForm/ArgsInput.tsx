import { Input, type InputProps } from '@lobehub/ui';
import React, { memo } from 'react';

import { argsToString, parseArgs } from '@/utils/args';

interface ArgsInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  onChange?: (value: string[]) => void;
  value?: string[];
}

const ArgsInput = memo<ArgsInputProps>(({ value, onChange, ...res }) => {
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim();
    if (inputValue) {
      const args = parseArgs(inputValue);
      onChange?.(args);
    } else {
      onChange?.([]);
    }
    res.onBlur?.(e);
  };

  return (
    <Input
      {...res}
      onBlur={handleBlur}
      onChange={(e) => {
        const inputValue = e.target.value;
        if (!inputValue.trim()) {
          onChange?.([]);
        } else {
          onChange?.(parseArgs(inputValue));
        }
      }}
      value={value ? argsToString(value) : ''}
    />
  );
});

export default ArgsInput;
