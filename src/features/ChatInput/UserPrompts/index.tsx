'use client';

import { ActionIcon, Input, Modal } from '@lobehub/ui';
import { useDebounceEffect, useDebounceFn } from 'ahooks';
import { InputRef } from 'antd';
import { createStyles } from 'antd-style';
import Fuse from 'fuse.js';
import { map } from 'lodash-es';
import { SearchIcon } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { useAutoFocus } from '@/app/chat/(desktop)/features/ChatInput/useAutoFocus';
import PromptSelectItem from '@/features/ChatInput/UserPrompts/PromptSelectItem';

import samples from './sample.json';

type Props = {
  maxItems?: number;
  onCancel?: () => any;
  onSelect?: (prompt: any) => any;
  open: boolean;
};

const useStyles = createStyles(({ css, token }) => ({
  itemList: css`
    margin-top: 0.5rem;
  `,
  modalContent: css`
    .ant-modal-header {
      border-bottom: 1px solid ${token.colorBorder};
    }

    .ant-modal-title {
      width: 100%;
    }

    .ant-modal-body {
      padding: 0 !important;
      padding-inline: 8px !important;
      padding-block: 8px !important;
    }
  `,
  notFound: css`
    opacity: 0.6;
    text-align: center;
  `,
  searchHeader: css`
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
  `,
}));

const UserPrompts = memo<Props>(({ open, onCancel, onSelect, maxItems = 10 }) => {
  const { styles } = useStyles();
  const searchInputRef = useRef<InputRef>(null);
  const [searchValue, setSearchValue] = useState('');
  const fuse = useMemo(() => {
    return new Fuse(samples, {
      keys: ['name'],
    });
  }, []);
  const list = useMemo(() => {
    if (searchValue) {
      const results = fuse.search(searchValue).map((v) => v.item);

      return results.splice(0, maxItems);
    }

    return samples.slice(0, maxItems);
  }, [fuse, searchValue, maxItems]);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const { run: debounceSetSearchValue } = useDebounceFn(
    (value: string) => {
      setSearchValue(value);
    },
    { wait: 300 },
  );
  const onOk = (item: any) => {
    onSelect?.(item);
    onCancel?.();
  };

  useAutoFocus(searchInputRef);

  useDebounceEffect(
    () => {
      searchInputRef?.current?.focus();
    },
    [open],
    {
      wait: 100, // Modal show animation duration
    },
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp': {
          setHighlightIndex((prevIndex) => Math.max(prevIndex - 1, 0));
          event.preventDefault();
          break;
        }
        case 'ArrowDown': {
          setHighlightIndex((prevIndex) => Math.min(prevIndex + 1, list.length - 1));
          event.preventDefault();
          break;
        }
        case 'Enter': {
          if (highlightIndex >= 0 && highlightIndex < list.length) {
            onOk(list[highlightIndex]);
            event.preventDefault();
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [list, highlightIndex]);

  useEffect(() => {
    if (highlightIndex >= list.length) {
      setHighlightIndex(Math.max(list.length - 1, 0));
    }

    if (highlightIndex === -1 && searchValue && list.length > 0) {
      setHighlightIndex(0);
    }

    document.querySelector(`[data-user-prompt-index="${highlightIndex}"]`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [list.length, highlightIndex, searchValue]);

  return (
    <Modal
      className={styles.modalContent}
      closable={false}
      footer={null}
      onCancel={onCancel}
      open={open}
      title={
        <div className={styles.searchHeader}>
          <ActionIcon icon={SearchIcon} />
          <Input
            onChange={(e) => {
              debounceSetSearchValue(e.target.value as string);
            }}
            placeholder={'Search...'}
            ref={searchInputRef}
            type={'pure'}
          />
        </div>
      }
    >
      <div className={styles.itemList}>
        <div>
          {list.length === 0 && <div className={styles.notFound}>Nothing found...</div>}
          {map(list, (item, index) => {
            return (
              <PromptSelectItem
                data-user-prompt-index={index}
                isActive={index === highlightIndex}
                key={index}
                onClick={() => onOk(item)}
                subtitle={item.content}
                title={item.name}
              />
            );
          })}
        </div>
      </div>
    </Modal>
  );
});

export default UserPrompts;
