import { ActionIcon, Icon } from '@lobehub/ui';
import { App, Dropdown, DropdownProps, MenuProps } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { MoreVertical, PencilLine, Settings2, Trash } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { preferenceSelectors } from '@/store/global/selectors';
import { groupHelpers } from '@/store/global/slices/common/helpers';

const useStyles = createStyles(({ css }) => ({
  modalRoot: css`
    z-index: 2000;
  `,
}));
interface ActionsProps extends Pick<DropdownProps, 'onOpenChange'> {
  id: string;
  openConfigModal: () => void;
  openRenameModal: () => void;
}

const Actions = memo<ActionsProps>(({ id, openRenameModal, openConfigModal, onOpenChange }) => {
  const { t } = useTranslation('common');
  const { styles } = useStyles();
  const { modal } = App.useApp();
  const sessionCustomGroups = useGlobalStore(preferenceSelectors.sessionCustomGroups, isEqual);
  const updateCustomGroup = useGlobalStore((s) => s.updateCustomGroup);
  const items: MenuProps['items'] = useMemo(
    () => [
      {
        icon: <Icon icon={PencilLine} />,
        key: 'rename',
        label: t('group.rename'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          openRenameModal();
        },
      },
      {
        icon: <Icon icon={Settings2} />,
        key: 'config',
        label: t('group.config'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          openConfigModal();
        },
      },
      {
        type: 'divider',
      },
      {
        danger: true,
        icon: <Icon icon={Trash} />,
        key: 'delete',
        label: t('delete'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          modal.confirm({
            cancelText: t('cancel'),
            centered: true,
            okButtonProps: { danger: true },
            okText: t('ok'),
            onOk: () => {
              updateCustomGroup(groupHelpers.removeGroup(id, sessionCustomGroups));
            },
            rootClassName: styles.modalRoot,
            title: t('group.confirmRemoveGroupAlert'),
          });
        },
      },
    ],
    [],
  );

  return (
    <Dropdown
      arrow={false}
      menu={{
        items,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
        },
      }}
      onOpenChange={onOpenChange}
      trigger={['click']}
    >
      <ActionIcon
        icon={MoreVertical}
        onClick={(e) => {
          e.stopPropagation();
        }}
        size={{ blockSize: 22, fontSize: 16 }}
        style={{ marginRight: -8 }}
      />
    </Dropdown>
  );
});

export default Actions;
