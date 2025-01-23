import { Input } from 'antd';
import { InputRef, InputProps as Props } from 'antd/es/input/Input';
import { memo, useRef, useState } from 'react';

interface FormInputProps extends Omit<Props, 'onChange'> {
  onChange?: (value: string) => void;
}

const FormInput = memo<FormInputProps>(({ onChange, value: defaultValue, ...props }) => {
  const ref = useRef<InputRef>(null);
  const isChineseInput = useRef(false);

  const [value, setValue] = useState(defaultValue as string);

  return (
    <Input
      onBlur={() => {
        onChange?.(value);
      }}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      onCompositionEnd={() => {
        isChineseInput.current = false;
      }}
      onCompositionStart={() => {
        isChineseInput.current = true;
      }}
      onPressEnter={() => {
        if (isChineseInput.current) return;
        onChange?.(value);
      }}
      ref={ref}
      {...props}
      value={value}
    />
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
