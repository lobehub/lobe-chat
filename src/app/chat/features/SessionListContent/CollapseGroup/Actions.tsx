import { Icon } from '@lobehub/ui';
import { App, Dropdown, DropdownProps, MenuProps } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { PencilLine, Rows3, Trash } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { groupHelpers } from '@/store/global/helpers';
import { settingsSelectors } from '@/store/global/selectors';
import { SessionDefaultGroup, SessionGroupId } from '@/types/session';

const useStyles = createStyles(({ css }) => ({
  modalRoot: css`
    z-index: 2000;
  `,
}));
interface ActionsProps extends DropdownProps {
  id: SessionGroupId;
  openConfigModal: () => void;
  openRenameModal?: () => void;
  title: string;
}

const Actions = memo<ActionsProps>(
  ({ id, openRenameModal, openConfigModal, onOpenChange, title }) => {
    const { t } = useTranslation('common');
    const { styles } = useStyles();
    const { modal } = App.useApp();
    const sessionCustomGroups = useGlobalStore(settingsSelectors.sessionCustomGroups, isEqual);
    const updateCustomGroup = useGlobalStore((s) => s.updateCustomGroup);

    const isCustomGroup = id !== SessionDefaultGroup.Pinned && id !== SessionDefaultGroup.Pinned;

    const items: MenuProps['items'] = useMemo(
      () => [
        {
          disabled: !isCustomGroup,
          icon: <Icon icon={PencilLine} />,
          key: 'rename',
          label: t('group.rename'),
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            openRenameModal?.();
          },
        },
        {
          icon: <Icon icon={Rows3} />,
          key: 'config',
          label: t('group.config'),
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
            openConfigModal?.();
          },
        },
        {
          type: 'divider',
        },
        {
          danger: true,
          disabled: !isCustomGroup,
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
        trigger={['contextMenu']}
      >
        <Flexbox horizontal>{title}</Flexbox>
      </Dropdown>
    );
  },
);

export default Actions;
