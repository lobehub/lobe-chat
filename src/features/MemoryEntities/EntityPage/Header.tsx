import { ActionIcon, DropdownMenu, Icon, Tag } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CombineIcon,
  MoreHorizontalIcon,
  RotateCcwIcon,
  Trash2Icon,
} from 'lucide-react';
import { memo } from 'react';

import { deleteEntity, openMergeModal } from '../actions';
import KindIcon from '../components/KindIcon';
import { isPerson } from '../derive';
import { KIND_META, STATUS_LABEL } from '../kinds';
import { useEntityDemoStore } from '../store';
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
  aliases: { color: cssVar.colorTextTertiary, fontSize: '13px' },
  description: {
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
  const backTo = useEntityDemoStore((s) =>
    s.entities.find((e) => e.id === s.history.at(-1)),
  );
  const back = useEntityDemoStore((s) => s.back);
  const setStatus = useEntityDemoStore((s) => s.setStatus);
  const person = isPerson(entity.kind);

  const statusTag =
    entity.status === 'active' ? null : (
      <Tag size={'small'}>{STATUS_LABEL[entity.status]}</Tag>
    );

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
              {person ? `${KIND_META.person.label} · ${entity.relationship} · 资料在「身份」中维护` : KIND_META[entity.kind].label}
            </span>
            {statusTag}
          </div>
          <h2 {...stylex.props(styles.title)}>{entity.title}</h2>
          {entity.aliases.length > 0 && (
            <span {...stylex.props(styles.aliases)}>也叫 {entity.aliases.join('、')}</span>
          )}
        </div>
        {!person && (
          <DropdownMenu
            items={[
              {
                icon: <Icon icon={CombineIcon} />,
                key: 'merge',
                label: '并入另一个情境…',
                onClick: () => openMergeModal(entity.id),
              },
              entity.status === 'active'
                ? {
                    icon: <Icon icon={ArchiveIcon} />,
                    key: 'close',
                    label: '标记为已结束',
                    onClick: () => setStatus(entity.id, 'closed'),
                  }
                : {
                    icon: <Icon icon={RotateCcwIcon} />,
                    key: 'reopen',
                    label: '标记为进行中',
                    onClick: () => setStatus(entity.id, 'active'),
                  },
              { type: 'divider' },
              {
                danger: true,
                icon: <Icon icon={Trash2Icon} />,
                key: 'delete',
                label: '删除',
                onClick: () => deleteEntity(entity.id),
              },
            ]}
          >
            <ActionIcon aria-label={'更多操作'} icon={MoreHorizontalIcon} title={'更多操作'} />
          </DropdownMenu>
        )}
      </div>
      <p {...stylex.props(styles.description)}>
        {entity.description}
      </p>
    </header>
  );
});

Header.displayName = 'EntityHeader';

export default Header;
