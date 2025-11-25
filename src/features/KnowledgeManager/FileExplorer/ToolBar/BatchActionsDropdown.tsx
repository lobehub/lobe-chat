import { Button, Icon } from '@lobehub/ui';
import { App, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useTheme } from 'antd-style';
import {
  BookMinusIcon,
  BookPlusIcon,
  ChevronDownIcon,
  CircleEllipsisIcon,
  FileBoxIcon,
  Trash2Icon,
} from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

export type MultiSelectActionType =
  | 'addToKnowledgeBase'
  | 'addToOtherKnowledgeBase'
  | 'batchChunking'
  | 'delete'
  | 'removeFromKnowledgeBase';

interface BatchActionsDropdownProps {
  disabled?: boolean;
  isInKnowledgeBase?: boolean;
  onActionClick: (type: MultiSelectActionType) => Promise<void>;
  selectCount: number;
}

const BatchActionsDropdown = memo<BatchActionsDropdownProps>(
  ({ selectCount, isInKnowledgeBase, onActionClick, disabled }) => {
    const { t } = useTranslation(['components', 'common']);
    const { modal, message } = App.useApp();
    const theme = useTheme();

    const menuItems = useMemo<MenuProps['items']>(() => {
      const items: MenuProps['items'] = [];

      if (isInKnowledgeBase) {
        items.push({
          icon: <Icon icon={BookMinusIcon} />,
          key: 'removeFromKnowledgeBase',
          label: t('FileManager.actions.removeFromKnowledgeBase'),
          onClick: () => {
            modal.confirm({
              okButtonProps: {
                danger: true,
              },
              onOk: async () => {
                await onActionClick('removeFromKnowledgeBase');
                message.success(t('FileManager.actions.removeFromKnowledgeBaseSuccess'));
              },
              title: t('FileManager.actions.confirmRemoveFromKnowledgeBase', {
                count: selectCount,
              }),
            });
          },
        });
        items.push({
          icon: <Icon icon={BookPlusIcon} />,
          key: 'addToOtherKnowledgeBase',
          label: t('FileManager.actions.addToOtherKnowledgeBase'),
          onClick: () => {
            onActionClick('addToOtherKnowledgeBase');
          },
        });
      } else {
        items.push({
          icon: <Icon icon={BookPlusIcon} />,
          key: 'addToKnowledgeBase',
          label: t('FileManager.actions.addToKnowledgeBase'),
          onClick: () => {
            onActionClick('addToKnowledgeBase');
          },
        });
      }

      items.push(
        {
          icon: <Icon icon={FileBoxIcon} />,
          key: 'batchChunking',
          label: t('FileManager.actions.batchChunking'),
          onClick: async () => {
            await onActionClick('batchChunking');
          },
        },
        {
          type: 'divider',
        },
      );

      items.push({
        danger: true,
        icon: <Icon icon={Trash2Icon} />,
        key: 'delete',
        label: t('delete', { ns: 'common' }),
        onClick: async () => {
          modal.confirm({
            okButtonProps: {
              danger: true,
            },
            onOk: async () => {
              await onActionClick('delete');
              message.success(t('FileManager.actions.deleteSuccess'));
            },
            title: t('FileManager.actions.confirmDeleteMultiFiles', { count: selectCount }),
          });
        },
      });

      return items;
    }, [isInKnowledgeBase, selectCount, onActionClick, t, modal, message]);

    return (
      <Dropdown
        disabled={disabled}
        menu={{ items: menuItems }}
        placement="bottomLeft"
        trigger={['click']}
      >
        <Button
          style={{ paddingInline: 4 }}
          title={t('FileManager.actions.batchActions', 'Batch actions')}
          type="text"
        >
          <Flexbox align={'center'} gap={4} horizontal>
            <Icon color={theme.colorIcon} icon={CircleEllipsisIcon} size={18} />
            <Icon color={theme.colorIcon} icon={ChevronDownIcon} size={14} />
          </Flexbox>
        </Button>
      </Dropdown>
    );
  },
);

BatchActionsDropdown.displayName = 'BatchActionsDropdown';

export default BatchActionsDropdown;
