import { ActionIcon, confirmModal, DropdownMenu, Icon, Tag, toast } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import {
  ArchiveIcon,
  ArrowLeftIcon,
  MoreHorizontalIcon,
  RotateCcwIcon,
  Trash2Icon,
} from 'lucide-react';
import { memo } from 'react';

import KindIcon from '../components/KindIcon';
import { useEntityDataContext } from '../context';
import { KIND_META, statusLabelOf } from '../kinds';
import { useEntityViewStore } from '../store';
import { type MemoryEntity } from '../types';

const styles = stylex.create({
  root: { display: 'flex', flexDirection: 'column', gap: '16px' },
  back: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderStyle: 'none',
    color: {
      default: cssVar.colorTextTertiary,
      ':hover': cssVar.colorText,
    },
    cursor: 'pointer',
    display: 'inline-flex',
    fontSize: '13px',
    gap: '4px',
    marginInlineStart: '-2px',
    paddingBlock: 0,
    paddingInline: 0,
  },
  top: { alignItems: 'flex-start', display: 'flex', gap: '12px' },
  titles: { display: 'flex', flex: '1', flexDirection: 'column', gap: '4px', minWidth: 0 },
  eyebrow: {
    alignItems: 'center',
    color: cssVar.colorTextTertiary,
    display: 'flex',
    fontSize: '12px',
    gap: '8px',
  },
  title: { fontSize: '24px', fontWeight: 600, lineHeight: '32px', margin: 0 },
  tags: { color: cssVar.colorTextTertiary, fontSize: '12px' },
  summary: {
    color: cssVar.colorTextSecondary,
    fontSize: '14px',
    lineHeight: '22px',
    margin: 0,
  },
});

interface HeaderProps {
  entity: MemoryEntity;
}

const Header = memo<HeaderProps>(({ entity }) => {
  const { entities, remove, setStatus } = useEntityDataContext();
  const backId = useEntityViewStore((s) => s.history.at(-1));
  const back = useEntityViewStore((s) => s.back);
  const select = useEntityViewStore((s) => s.select);
  const ensureSelected = useEntityViewStore((s) => s.ensureSelected);
  const backTo = entities.find((e) => e.id === backId);
  const statusLabel = statusLabelOf(entity.statusValue);
  // The free-text type is shown when it says more than the kind it was folded into.
  const typeNote =
    entity.rawType && entity.rawType.toLowerCase() !== entity.kind ? entity.rawType : undefined;

  const handleStatus = async (value: string, status: MemoryEntity['status']) => {
    ensureSelected(entity.id);
    try {
      await setStatus(entity.id, value, status);
    } catch {
      toast.error({ title: '状态没有改成功，请重试' });
    }
  };

  // The backend deletes for good, so this one asks first.
  const handleDelete = () =>
    confirmModal({
      cancelText: '取消',
      content: '删除后无法恢复。之后的对话里再提到它，可能会重新生成一页。',
      okButtonProps: { danger: true },
      okText: '删除',
      onOk: async () => {
        try {
          await remove(entity.id);
          select(entities.find((e) => e.id !== entity.id && e.status === 'active')?.id);
          toast.success({ title: `已删除「${entity.title}」` });
        } catch {
          toast.error({ title: '删除没有成功，请重试' });
        }
      },
      title: `删除「${entity.title}」？`,
    });

  return (
    <header {...stylex.props(styles.root)}>
      {backTo && (
        <button type={'button'} {...stylex.props(styles.back)} onClick={back}>
          <Icon icon={ArrowLeftIcon} size={14} />
          返回「{backTo.title}」
        </button>
      )}
      <div {...stylex.props(styles.top)}>
        <KindIcon kind={entity.kind} size={'lg'} />
        <div {...stylex.props(styles.titles)}>
          <div {...stylex.props(styles.eyebrow)}>
            <span>
              {KIND_META[entity.kind].label}
              {typeNote && ` · ${typeNote}`}
            </span>
            {statusLabel && <Tag size={'small'}>{statusLabel}</Tag>}
          </div>
          <h2 {...stylex.props(styles.title)}>{entity.title}</h2>
          {entity.tags.length > 0 && (
            <span {...stylex.props(styles.tags)}>
              {entity.tags.map((tag) => `#${tag}`).join('  ')}
            </span>
          )}
        </div>
        <DropdownMenu
          items={[
            entity.status === 'closed'
              ? {
                  icon: <Icon icon={RotateCcwIcon} />,
                  key: 'reopen',
                  label: '标记为进行中',
                  onClick: () => handleStatus('ongoing', 'active'),
                }
              : {
                  icon: <Icon icon={ArchiveIcon} />,
                  key: 'close',
                  label: '标记为已完成',
                  onClick: () => handleStatus('completed', 'closed'),
                },
            { type: 'divider' },
            {
              danger: true,
              icon: <Icon icon={Trash2Icon} />,
              key: 'delete',
              label: '删除…',
              onClick: handleDelete,
            },
          ]}
        >
          <ActionIcon aria-label={'更多操作'} icon={MoreHorizontalIcon} title={'更多操作'} />
        </DropdownMenu>
      </div>
      {entity.summary && entity.summary !== entity.description && (
        <p {...stylex.props(styles.summary)}>{entity.summary}</p>
      )}
    </header>
  );
});

Header.displayName = 'EntityHeader';

export default Header;
