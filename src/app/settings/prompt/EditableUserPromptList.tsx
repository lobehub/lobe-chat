'use client';

import { ActionIcon, Icon } from '@lobehub/ui';
import { ControlInput } from '@lobehub/ui/es/components/ControlInput';
import { useDynamicList } from 'ahooks';
import { Button } from 'antd';
import isEqual from 'fast-deep-equal';
import { map } from 'lodash-es';
import { Plus, Trash } from 'lucide-react';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { v4 } from 'uuid';

import { UserPrompt } from '@/types/settings';

export interface EditableMessageListProps {
  dataSources: UserPrompt[];
  onChange?: (userPrompts: UserPrompt[]) => void;
}

export const EditableMessageList = memo<EditableMessageListProps>(({ dataSources, onChange }) => {
  const { t } = useTranslation('setting');
  const { list, replace, remove, push } = useDynamicList(dataSources);

  useEffect(() => {
    if (!isEqual(dataSources, list)) {
      onChange?.(list);
    }
  }, [list]);

  return dataSources ? (
    <Flexbox gap={12}>
      {map(list, (item, index) => (
        <Flexbox
          align={'center'}
          gap={8}
          horizontal
          key={`${index}-${item.content}`}
          width={'100%'}
        >
          <ControlInput
            onChange={(e) => {
              replace(index, {
                ...item,
                name: e,
              });
            }}
            placeholder={t('settingPrompt.input.name')}
            style={{
              maxWidth: '40%',
              width: 300,
            }}
            value={item.name}
          />
          <ControlInput
            onChange={(e) => {
              replace(index, {
                ...item,
                content: e,
              });
            }}
            placeholder={t('settingPrompt.input.content')}
            value={item.content}
          />
          <ActionIcon
            icon={Trash}
            onClick={() => {
              remove(index);
            }}
            placement="right"
            size={{ fontSize: 16 }}
            title={t('settingPrompt.delete')}
          />
        </Flexbox>
      ))}
      <Button
        block
        icon={<Icon icon={Plus} />}
        onClick={() => {
          const id = v4();
          push({
            content: '',
            id,
            name: '',
          });
        }}
      >
        {t('settingPrompt.input.add')}
      </Button>
    </Flexbox>
  ) : undefined;
}, isEqual);

export default EditableMessageList;
