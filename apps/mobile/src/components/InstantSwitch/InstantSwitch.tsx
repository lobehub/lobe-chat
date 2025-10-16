import { memo, useEffect, useState } from 'react';
import useMergeState from 'use-merge-value';

import Switch from '../Switch';
import type { InstantSwitchProps } from './type';

const InstantSwitch = memo<InstantSwitchProps>(
  ({ defaultChecked = false, checked, onChange, disabled, loading, ...rest }) => {
    const [toggling, setToggling] = useState(loading);
    // 使用独立的乐观状态来立即反映用户操作
    const [optimisticValue, setOptimisticValue] = useState(checked);
    // 使用 useMergeState 管理外部和内部状态同步
    const [value, setValue] = useMergeState(defaultChecked, {
      defaultValue: defaultChecked,
      onChange: async (v: boolean) => {
        // 立即更新乐观值
        setOptimisticValue(v);
        setToggling(true);

        try {
          await onChange?.(v);
          // 成功后，确保乐观值与实际值一致
          setOptimisticValue(v);
        } catch (error) {
          // 失败时回滚到原始值
          setOptimisticValue(value);
          console.error('InstantSwitch onChange error:', error);
        } finally {
          setToggling(false);
        }
      },
      value: checked,
    });

    // 当外部 checked 或内部 value 变化时，同步到乐观值（非 toggling 期间）
    useEffect(() => {
      if (!toggling) {
        setOptimisticValue(value);
      }
    }, [value, toggling]);

    return (
      <Switch
        checked={optimisticValue}
        defaultChecked={defaultChecked}
        disabled={toggling || disabled}
        onChange={setValue}
        {...rest}
      />
    );
  },
);

InstantSwitch.displayName = 'InstantSwitch';

export default InstantSwitch;
