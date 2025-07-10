import { ActionIcon, Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import fastDeepEqual from 'fast-deep-equal';
import { LucidePlus, LucideTrash } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { v4 as uuidv4 } from 'uuid';

import { FormInput } from '@/components/FormInput';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    position: relative;

    width: 100%;
    padding: 12px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;
  `,
  input: css`
    font-family: ${token.fontFamilyCode};
    font-size: 12px;
  `,
  row: css`
    margin-block-end: 8px;

    &:last-child {
      margin-block-end: 0;
    }
  `,
  title: css`
    margin-block-end: 8px;
    color: ${token.colorTextTertiary};
  `,
}));

interface KeyValueItem {
  id: string;
  key: string;
  value: string;
}

export interface EnvEditorProps {
  onChange?: (value: Record<string, string>) => void;
  value?: Record<string, string>;
}

const recordToLocalList = (
  record: Record<string, string> | undefined | null = {},
): KeyValueItem[] =>
  Object.entries(record || {}).map(([key, val]) => ({
    id: uuidv4(),
    key,
    value: typeof val === 'string' ? val : '',
  }));

const localListToRecord = (
  list: KeyValueItem[] | undefined | null = [],
): Record<string, string> => {
  const record: Record<string, string> = {};
  const keys = new Set<string>();
  (list || [])
    .slice()
    .reverse()
    .forEach((item) => {
      const trimmedKey = item.key.trim();
      if (trimmedKey && !keys.has(trimmedKey)) {
        record[trimmedKey] = typeof item.value === 'string' ? item.value : '';
        keys.add(trimmedKey);
      }
    });
  return Object.keys(record)
    .reverse()
    .reduce(
      (acc, key) => {
        acc[key] = record[key];
        return acc;
      },
      {} as Record<string, string>,
    );
};

const EnvEditor = memo<EnvEditorProps>(({ value, onChange }) => {
  const { styles } = useStyles();
  const { t } = useTranslation(['plugin', 'common']);
  const [items, setItems] = useState<KeyValueItem[]>(() => recordToLocalList(value));
  const prevValueRef = useRef<Record<string, string> | undefined>(undefined);

  useEffect(() => {
    const externalRecord = value || {};
    if (!fastDeepEqual(externalRecord, prevValueRef.current)) {
      setItems(recordToLocalList(externalRecord));
      prevValueRef.current = externalRecord;
    }
  }, [value]);

  const triggerChange = (newItems: KeyValueItem[]) => {
    const keysCount: Record<string, number> = {};
    newItems.forEach((item) => {
      const trimmedKey = item.key.trim();
      if (trimmedKey) {
        keysCount[trimmedKey] = (keysCount[trimmedKey] || 0) + 1;
      }
    });
    setItems(
      newItems.map((item) => ({
        ...item,
      })),
    );
    onChange?.(localListToRecord(newItems));
  };

  const handleAdd = () => {
    const newItems = [...items, { id: uuidv4(), key: '', value: '' }];
    triggerChange(newItems);
  };

  const handleRemove = (id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    triggerChange(newItems);
  };

  const handleKeyChange = (id: string, newKey: string) => {
    const newItems = items.map((item) => (item.id === id ? { ...item, key: newKey } : item));
    triggerChange(newItems);
  };

  const handleValueChange = (id: string, newValue: string) => {
    const newItems = items.map((item) => (item.id === id ? { ...item, value: newValue } : item));
    triggerChange(newItems);
  };

  const getDuplicateKeys = (currentItems: KeyValueItem[]): Set<string> => {
    const keys = new Set<string>();
    const duplicates = new Set<string>();
    currentItems.forEach((item) => {
      const trimmedKey = item.key.trim();
      if (trimmedKey) {
        if (keys.has(trimmedKey)) {
          duplicates.add(trimmedKey);
        } else {
          keys.add(trimmedKey);
        }
      }
    });
    return duplicates;
  };
  const duplicateKeys = getDuplicateKeys(items);

  return (
    <div className={styles.container}>
      <Flexbox className={styles.title} gap={8} horizontal>
        <Flexbox flex={1}>key</Flexbox>
        <Flexbox flex={2}>value</Flexbox>
        <Flexbox style={{ width: 30 }} />
      </Flexbox>
      <Flexbox width={'100%'}>
        {items.map((item) => {
          const isDuplicate = item.key.trim() && duplicateKeys.has(item.key.trim());
          return (
            <Flexbox
              align="flex-start"
              className={styles.row}
              gap={8}
              horizontal
              key={item.id}
              width={'100%'}
            >
              <Flexbox flex={1} style={{ position: 'relative' }}>
                <FormInput
                  className={styles.input}
                  onChange={(e) => handleKeyChange(item.id, e)}
                  placeholder={'key'}
                  status={isDuplicate ? 'error' : undefined}
                  value={item.key}
                  variant={'filled'}
                />
                {isDuplicate && (
                  <div
                    style={{
                      bottom: '-16px',
                      color: 'red',
                      fontSize: '12px',
                      position: 'absolute',
                    }}
                  >
                    {t('dev.mcp.env.duplicateKeyError')}
                  </div>
                )}
              </Flexbox>
              <Flexbox flex={2}>
                <FormInput
                  className={styles.input}
                  onChange={(value) => handleValueChange(item.id, value)}
                  placeholder={'value'}
                  value={item.value}
                  variant={'filled'}
                />
              </Flexbox>
              <ActionIcon
                icon={LucideTrash}
                onClick={() => handleRemove(item.id)}
                size={'small'}
                style={{ marginTop: 4 }}
                title={t('delete', { ns: 'common' })}
              />
            </Flexbox>
          );
        })}
        <Button
          block
          icon={<Icon icon={LucidePlus} />}
          onClick={handleAdd}
          size={'small'}
          style={{ marginTop: items.length > 0 ? 16 : 8 }}
          type="dashed"
        >
          {t('dev.mcp.env.add')}
        </Button>
      </Flexbox>
    </div>
  );
});

export default EnvEditor;
