import { ActionIcon, Icon } from '@lobehub/ui';
import { App, Dropdown, DropdownProps, MenuProps } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { MoreVertical, PencilLine, Settings2, Trash } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { groupHelpers } from '@/store/global/helpers';
import { settingsSelectors } from '@/store/global/selectors';

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
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const { modal } = App.useApp();
  const sessionCustomGroups = useGlobalStore(settingsSelectors.sessionCustomGroups, isEqual);
  const updateCustomGroup = useGlobalStore((s) => s.updateCustomGroup);
  const items: MenuProps['items'] = useMemo(
    () => [
      {
        icon: <Icon icon={PencilLine} />,
        key: 'rename',
        label: t('sessionGroup.rename'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          openRenameModal();
        },
      },
      {
        icon: <Icon icon={Settings2} />,
        key: 'config',
        label: t('sessionGroup.config'),
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
        label: t('delete', { ns: 'common' }),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          modal.confirm({
            centered: true,
            okButtonProps: { danger: true },
            onOk: () => {
              updateCustomGroup(groupHelpers.removeGroup(id, sessionCustomGroups));
            },
            rootClassName: styles.modalRoot,
            title: t('sessionGroup.confirmRemoveGroupAlert'),
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
