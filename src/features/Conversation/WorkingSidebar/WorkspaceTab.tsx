import { type ContextMenuItem, ContextMenuTrigger, Icon, type IconProps } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { PinIcon, XIcon } from 'lucide-react';
import { memo, type ReactNode } from 'react';

const styles = stylex.create({
  close: {
    cursor: 'pointer',
    position: 'absolute',
    insetBlockStart: '50%',
    insetInlineEnd: '4px',
    transform: 'translateY(-50%)',
    display: 'grid',
    placeItems: 'center',
    width: '20px',
    height: '20px',
    padding: 0,
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: '4px',
    color: { 'default': cssVar.colorTextTertiary, ':hover': cssVar.colorText },
    opacity: {
      default: 0,
      [stylex.when.ancestor(':hover')]: 1,
      [stylex.when.ancestor(':focus-within')]: 1,
    },
    backgroundColor: { 'default': 'transparent', ':hover': cssVar.colorFillSecondary },
    backgroundImage: { 'default': 'none', ':hover': 'none' },
    transition: 'opacity 0.15s',
  },
  container: {
    position: 'relative',
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    borderRadius: '6px',
    transition: 'background 0.15s',
    backgroundColor: { 'default': null, ':hover': cssVar.colorFillSecondary },
    backgroundImage: { 'default': null, ':hover': 'none' },
  },
  // Composed after `container`: a conditional value replaces the whole property,
  // so the hover colour is restated here.
  containerActive: {
    backgroundColor: { 'default': cssVar.colorFillTertiary, ':hover': cssVar.colorFillSecondary },
    backgroundImage: { 'default': 'none', ':hover': 'none' },
  },
  pinned: {
    pointerEvents: 'none',
    position: 'absolute',
    insetBlockStart: '50%',
    insetInlineEnd: '8px',
    transform: 'translateY(-50%)',
    display: 'grid',
    placeItems: 'center',
    color: cssVar.colorTextSecondary,
  },
  label: { overflow: 'hidden', maxWidth: '160px', textOverflow: 'ellipsis' },
  tab: {
    cursor: 'pointer',
    paddingBlock: '4px',
    paddingInline: '10px',
    borderWidth: 0,
    borderStyle: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    // attribute selector outranks the base class so the active color can't lose
    // to stylesheet ordering
    color: {
      'default': cssVar.colorTextTertiary,
      ':hover': cssVar.colorText,
      "[aria-pressed='true']": cssVar.colorText,
    },
    whiteSpace: 'nowrap',
    backgroundColor: 'transparent',
    backgroundImage: 'none',
    transition: 'color 0.15s',
  },
  tabClosable: { paddingInlineEnd: '30px' },
  trigger: { display: 'flex', gap: '4px', alignItems: 'center' },
});

interface WorkspaceTabProps {
  active: boolean;
  closeLabel?: string;
  contextMenuItems?: ContextMenuItem[];
  icon: IconProps['icon'];
  iconNode?: ReactNode;
  label: ReactNode;
  onClose?: () => void;
  onSelect: () => void;
  pinned?: boolean;
  pinnedLabel?: string;
  tabKey: string;
}

const WorkspaceTab = memo<WorkspaceTabProps>(
  ({
    active,
    closeLabel,
    contextMenuItems,
    icon,
    iconNode,
    label,
    onClose,
    onSelect,
    pinned,
    pinnedLabel,
    tabKey,
  }) => {
    const content = (
      <div
        {...stylex.props(
          styles.container,
          stylex.defaultMarker(),
          active && styles.containerActive,
        )}
        data-pinned={pinned ? 'true' : undefined}
      >
        <button
          aria-pressed={active}
          {...stylex.props(styles.tab, (onClose || pinned) && styles.tabClosable)}
          data-tab-key={tabKey}
          type="button"
          onClick={onSelect}
        >
          <span {...stylex.props(styles.trigger)}>
            {iconNode ?? <Icon icon={icon} size={14} />}
            <span {...stylex.props(styles.label)}>{label}</span>
          </span>
        </button>
        {pinned ? (
          <span aria-label={pinnedLabel} {...stylex.props(styles.pinned)} role="img">
            <Icon icon={PinIcon} size={12} />
          </span>
        ) : onClose ? (
          <button
            data-tab-close
            aria-label={closeLabel}
            {...stylex.props(styles.close)}
            type="button"
            onClick={onClose}
          >
            <Icon icon={XIcon} size={12} />
          </button>
        ) : null}
      </div>
    );

    return contextMenuItems ? (
      <ContextMenuTrigger items={contextMenuItems}>{content}</ContextMenuTrigger>
    ) : (
      content
    );
  },
);

WorkspaceTab.displayName = 'WorkingSidebarTab';

export default WorkspaceTab;
