import { useControllableValue } from 'ahooks';
import { createStyles } from 'antd-style';
import React, { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(
  ({ css, token }) => css`
    width: ${token.controlHeight}px;
    height: ${token.controlHeight}px;
    border: 1px solid ${token.colorBorder};
    border-radius: 8px;

    font-size: 16px;
    color: ${token.colorText};
    text-align: center;

    background: ${token.colorBgContainer};

    &:focus,
    &:focus-visible {
      border-color: ${token.colorPrimary};
      outline: none;
    }
  `,
);

/**
 * Let's borrow some props from HTML "input". More info below:
 *
 * [Pick Documentation](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)
 *
 * [How to extend HTML Elements](https://reacthustle.com/blog/how-to-extend-html-elements-in-react-typescript)
 */
type PartialInputProps = Pick<React.ComponentPropsWithoutRef<'input'>, 'className' | 'style'>;

interface OtpInputProps extends PartialInputProps {
  onChange?: (value: string) => void;
  /**
   * Number of characters/input for this component
   */
  size?: number;
  /**
   * Validation pattern for each input.
   * e.g: /[0-9]{1}/ for digits only or /[0-9a-zA-Z]{1}/ for alphanumeric
   */
  validationPattern?: RegExp;
  /**
   * full value of the otp input, up to {size} characters
   */
  value?: string;
}

const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const current = e.currentTarget;
  if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
    const prev = current.previousElementSibling as HTMLInputElement | null;
    prev?.focus();
    prev?.setSelectionRange(0, 1);
    return;
  }

  if (e.key === 'ArrowRight') {
    const prev = current.nextSibling as HTMLInputElement | null;
    prev?.focus();
    prev?.setSelectionRange(0, 1);
    return;
  }
};

const OtpInput = memo<OtpInputProps>((props) => {
  const {
    //Set the default size to 6 characters
    size = 6,
    //Default validation is digits
    validationPattern = /\d/,
    value: outerValue,
    onChange,
    className,
    ...restProps
  } = props;
  const [value, setValue] = useControllableValue({ onChange, value: outerValue });

  const { styles, cx } = useStyles();
  // Create an array based on the size.
  const arr = Array.from({ length: size }).fill('-');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const elem = e.target;
    const val = e.target.value;

    // check if the value is valid
    if (!validationPattern.test(val) && val !== '') return;

    // change the value using onChange props
    const valueArr = value?.split('') || [];
    valueArr[index] = val;
    const newVal = valueArr.join('').slice(0, 6);
    setValue(newVal);

    //focus the next element if there's a value
    if (val) {
      const next = elem.nextElementSibling as HTMLInputElement | null;
      next?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const val = e.clipboardData.getData('text').slice(0, Math.max(0, size));

    setValue(val);
  };

  return (
    <Flexbox gap={12} horizontal>
      {arr.map((_, index) => {
        return (
          <input
            key={index}
            {...restProps}
            className={cx(styles, className)}
            maxLength={6}
            onChange={(e) => handleInputChange(e, index)}
            onKeyUp={handleKeyUp}
            onPaste={handlePaste}
            pattern={validationPattern.source}
            type="text"
            value={value?.at(index) ?? ''}
          />
        );
      })}
    </Flexbox>
  );
});

export default OtpInput;
