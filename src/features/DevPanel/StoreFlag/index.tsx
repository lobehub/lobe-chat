'use client';

import { CopyButton } from '@lobehub/ui';
import { useUpdateEffect } from 'ahooks';
import { Button, Checkbox, CheckboxProps, Divider, Input, type InputRef, Space } from 'antd';
import { intersection } from 'lodash-es';
import { useMemo, useRef, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { storeNames } from '@/store/middleware/createDevtools';

const SEPARATOR = ',';
const ALL = '*';

const StoreFlag = () => {
  const [url] = useState(() => new URL(window.location.href));

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

  const flattenStr = checkedList.sort().join(SEPARATOR);

  const [isValid, omittedUrl, realUrl] = useMemo(() => {
    let _isValid: boolean = false;
    try {
      const params = new URLSearchParams(url.search);
      if (checkedList.length > 0) {
        params.set('debug', checkAll ? ALL : checkedList.join(SEPARATOR));
      } else {
        params.delete('debug');
      }
      url.search = params.toString();
      const omitted = `${url.protocol}//${url.host}/...?debug=${params.get('debug') ?? ''}`;
      const realUrl = url.toString();
      _isValid = realUrl !== window.location.href;
      return [_isValid, omitted, url.toString()];
    } catch {
      // no-thing
    }
    return [_isValid];
  }, [url, flattenStr]);

  const urlInputRef = useRef<InputRef>(null);

  useUpdateEffect(() => {
    if (omittedUrl && omittedUrl.length) {
      urlInputRef.current?.focus();
      urlInputRef.current?.setSelectionRange(omittedUrl.length, omittedUrl.length);
    }
  }, [omittedUrl]);

  const handleApply = () => {
    window.location.href = realUrl!;
  };

  return (
    <Flexbox>
      <Flexbox padding={16}>
        <Checkbox.Group
          onChange={onChange}
          options={Array.from(storeNames)}
          style={{ flexDirection: 'column', gap: 16 }}
          value={checkedList}
        />
      </Flexbox>
      <Divider />
      <Flexbox align="center" gap={8} horizontal justify="space-between" padding={16}>
        <Checkbox
          checked={checkAll}
          indeterminate={indeterminate}
          onChange={onCheckAllChange}
          style={{ flex: `1 0 auto` }}
        >
          Check all
        </Checkbox>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            readOnly
            ref={urlInputRef}
            style={{ userSelect: 'none' }}
            value={omittedUrl}
            variant="filled"
          />
          <CopyButton content={realUrl!} disabled={!isValid} variant="borderless" />
          <Button disabled={!isValid} onClick={handleApply} type="primary">
            Apply
          </Button>
        </Space.Compact>
      </Flexbox>
    </Flexbox>
  );
};

export default StoreFlag;
