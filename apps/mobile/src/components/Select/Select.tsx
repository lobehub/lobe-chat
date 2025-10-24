import { ChevronDown } from 'lucide-react-native';
import { memo, useCallback, useState } from 'react';
import useMergeState from 'use-merge-value';

import Block from '../Block';
import BottomSheet from '../BottomSheet';
import Flexbox from '../Flexbox';
import Icon from '../Icon';
import { useThemeMode } from '../styles';
import SelectItem from './SelectItem';
import { useStyles } from './style';
import type { SelectProps } from './type';

const Select = memo<SelectProps>(
  ({
    defaultValue,
    value,
    onChange,
    options,
    variant,
    disabled,
    size = 'middle',
    style,
    title,
    optionRender,
    bottomSheetProps,
    textProps,
    ...rest
  }) => {
    const [showModal, setShowModal] = useState(false);
    const { styles, theme } = useStyles({ size });
    const { isDarkMode } = useThemeMode();
    const [selected, setSelected] = useMergeState(defaultValue || options[0]?.value, {
      defaultValue: defaultValue || options[0]?.value,
      onChange,
      value,
    });

    const selectedOption = options.find((option) => option.value === selected) || options[0];

    const handleSelect = useCallback(
      (optionValue: string | number) => {
        setShowModal(false);
        setSelected(optionValue);
      },
      [setSelected, setShowModal],
    );

    const handleOpen = useCallback(() => {
      if (!disabled) {
        setShowModal(true);
      }
    }, [disabled]);

    const handleClose = useCallback(() => {
      setShowModal(false);
    }, []);

    return (
      <>
        {/* 选择器触发器 */}
        <Block
          align={'center'}
          disabled={disabled}
          gap={8}
          horizontal
          onPress={handleOpen}
          style={[styles.container, disabled && { opacity: 0.6 }, style]}
          variant={disabled ? 'filled' : variant ? variant : isDarkMode ? 'filled' : 'outlined'}
          {...rest}
        >
          <SelectItem size={size} textProps={textProps} {...selectedOption} />
          <Icon
            color={theme.colorTextDescription}
            icon={ChevronDown}
            size={styles.sizeStyles.fontSize}
          />
        </Block>

        {/* 选项列表 BottomSheet */}
        <BottomSheet onClose={handleClose} open={showModal} title={title} {...bottomSheetProps}>
          <Flexbox paddingBlock={16}>
            {options.map((option, index) => {
              const isSelected = option.value === selected;
              const content = optionRender ? (
                optionRender(option, index)
              ) : (
                <SelectItem {...option} />
              );

              return (
                <Block
                  active={isSelected}
                  borderRadius={0}
                  disabled={option.disabled}
                  key={option.value}
                  onPress={(event) => {
                    event.stopPropagation();
                    if (option.disabled) return;
                    handleSelect(option.value);
                  }}
                  padding={16}
                  pressEffect
                  style={[option.disabled && { opacity: 0.4 }]}
                  variant={'borderless'}
                >
                  {content}
                </Block>
              );
            })}
          </Flexbox>
        </BottomSheet>
      </>
    );
  },
);

Select.displayName = 'Select';

export default Select;
