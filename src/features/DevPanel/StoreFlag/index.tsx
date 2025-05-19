'use client';

import { useBoolean } from 'ahooks';
import { Button, Checkbox, Divider } from 'antd';
import type { CheckboxProps } from 'antd';
import { intersection } from 'lodash-es';
import { useEffect, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { storeNames } from '@/store/middleware/createDevtools';

const SEPARATOR = '~';
const ALL = '*';

const StoreFlag = () => {
  const [url] = useState(() => new URL(window.location.href));
  const [sync, { setTrue: onSync, setFalse: offSync }] = useBoolean(false);

  const [checkedList, setCheckedList] = useState<string[]>(() => {
    const debug = url.searchParams.get('debug');
    if (debug === ALL) return Array.from(storeNames);
    return intersection(Array.from(storeNames), debug?.split(SEPARATOR) ?? []);
  });

  const checkAll = storeNames.size === checkedList.length;
  const indeterminate = checkedList.length > 0 && checkedList.length < storeNames.size;

  const onChange = (list: string[]) => {
    setCheckedList(list);
  };

  const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
    setCheckedList(e.target.checked ? Array.from(storeNames) : []);
  };

  const handleApply = () => {
    try {
      onSync();
      const params = new URLSearchParams(url.search);
      if (checkedList.length > 0) {
        params.set('debug', checkAll ? ALL : checkedList.join(SEPARATOR));
      } else {
        params.delete('debug');
      }
      url.search = params.toString();
      window.location.href = url.toString();
    } catch (error) {
      offSync();
    }
  };

  return (
    <Flexbox>
      <Flexbox paddingInline={16}>
        <Checkbox.Group
          style={{ gap: 16, flexDirection: 'column' }}
          options={Array.from(storeNames)}
          value={checkedList}
          onChange={onChange}
        />
      </Flexbox>
      <Divider />
      <Flexbox padding={16} justify="space-between" horizontal align="center">
        <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
          Check all
        </Checkbox>
        <Button type="primary" onClick={handleApply} loading={sync}>
          Apply
        </Button>
      </Flexbox>
    </Flexbox>
  );
};

export default StoreFlag;
