import { Button, Empty, SearchBar } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { SearchXIcon, Undo2Icon } from 'lucide-react';
import { memo, useMemo, useState } from 'react';

import { isPerson, lastTouchedOf } from '../derive';
import { CONTEXT_KINDS, KIND_META } from '../kinds';
import { useEntityDemoStore } from '../store';
import { type MemoryEntity } from '../types';
import ListItem from './ListItem';

const styles = stylex.create({
  root: {
    borderInlineEndColor: cssVar.colorBorderSecondary,
    borderInlineEndStyle: 'solid',
    borderInlineEndWidth: '1px',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    height: '100%',
    width: '320px',
  },
  head: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingBlockEnd: '8px',
    paddingBlockStart: '20px',
    paddingInline: '16px',
  },
  heading: { alignItems: 'baseline', display: 'flex', gap: '8px' },
  title: { fontSize: '17px', fontWeight: 600, margin: 0 },
  count: { color: cssVar.colorTextTertiary, fontSize: '13px' },
  scroll: {
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    gap: '20px',
    overflowY: 'auto',
    paddingBlockEnd: '24px',
    paddingBlockStart: '8px',
    paddingInline: '8px',
  },
  group: { display: 'flex', flexDirection: 'column', gap: '2px' },
  groupLabel: {
    alignItems: 'baseline',
    color: cssVar.colorTextTertiary,
    display: 'flex',
    fontSize: '12px',
    gap: '6px',
    paddingBlockEnd: '4px',
    paddingInline: '8px',
  },
  groupName: { color: cssVar.colorTextSecondary, fontWeight: 500 },
  deletedRow: {
    alignItems: 'center',
    color: cssVar.colorTextTertiary,
    display: 'flex',
    fontSize: '13px',
    gap: '8px',
    paddingBlock: '4px',
    paddingInlineEnd: '4px',
    paddingInlineStart: '8px',
  },
  deletedTitle: {
    flex: '1',
    overflow: 'hidden',
    textDecorationLine: 'line-through',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  noMatch: { paddingBlock: '48px' },
});

const matches = (entity: MemoryEntity, keyword: string) =>
  [entity.title, entity.now, ...entity.aliases].some((text) =>
    text.toLowerCase().includes(keyword),
  );

const EntityList = memo(() => {
  const [keyword, setKeyword] = useState('');
  const entities = useEntityDemoStore((s) => s.entities);
  const activities = useEntityDemoStore((s) => s.activities);
  const deletedIds = useEntityDemoStore((s) => s.deletedIds);
  const selectedId = useEntityDemoStore((s) => s.selectedId);
  const select = useEntityDemoStore((s) => s.select);
  const restore = useEntityDemoStore((s) => s.restore);

  // People are kept in 身份; they open from links but are not listed here.
  const contexts = useMemo(
    () => entities.filter((e) => !isPerson(e.kind) && !deletedIds.includes(e.id)),
    [entities, deletedIds],
  );
  const deleted = entities.filter((e) => deletedIds.includes(e.id));

  const groups = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    const visible = (needle ? contexts.filter((e) => matches(e, needle)) : contexts)
      .map((entity) => ({
        entity,
        lastTouchedAt: lastTouchedOf(entity, activities),
      }))
      .sort((a, b) => b.lastTouchedAt.localeCompare(a.lastTouchedAt));

    const live = visible.filter((item) => item.entity.status === 'active');
    return [
      ...CONTEXT_KINDS.map((kind) => ({
        items: live.filter((item) => item.entity.kind === kind),
        key: kind,
        label: KIND_META[kind].label,
        muted: false,
      })),
      {
        items: visible.filter((item) => item.entity.status !== 'active'),
        key: 'quiet',
        label: '沉寂与已结束',
        muted: true,
      },
    ].filter((group) => group.items.length > 0);
  }, [contexts, activities, keyword]);

  return (
    <aside aria-label={'情境列表'} {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.head)}>
        <div {...stylex.props(styles.heading)}>
          <h1 {...stylex.props(styles.title)}>情境</h1>
          <span {...stylex.props(styles.count)}>{contexts.length}</span>
        </div>
        <SearchBar
          allowClear
          placeholder={'搜索名称、别名或现状'}
          value={keyword}
          variant={'filled'}
          onInputChange={setKeyword}
        />
      </div>
      <div {...stylex.props(styles.scroll)}>
        {groups.length === 0 ? (
          <div {...stylex.props(styles.noMatch)}>
            <Empty
              description={`没有找到和「${keyword.trim()}」有关的情境`}
              icon={SearchXIcon}
              action={
                <Button size={'small'} onClick={() => setKeyword('')}>
                  清除搜索
                </Button>
              }
            />
          </div>
        ) : (
          groups.map((group) => (
            <section aria-label={group.label} key={group.key} {...stylex.props(styles.group)}>
              <div {...stylex.props(styles.groupLabel)}>
                <span {...stylex.props(styles.groupName)}>{group.label}</span>
                <span>{group.items.length}</span>
              </div>
              {group.items.map((item) => (
                <ListItem
                  active={item.entity.id === selectedId}
                  entity={item.entity}
                  key={item.entity.id}
                  lastTouchedAt={item.lastTouchedAt}
                  muted={group.muted}
                  onSelect={select}
                />
              ))}
            </section>
          ))
        )}
        {deleted.length > 0 && !keyword && (
          <section aria-label={'最近删除'} {...stylex.props(styles.group)}>
            <div {...stylex.props(styles.groupLabel)}>
              <span {...stylex.props(styles.groupName)}>最近删除</span>
              <span>30 天后彻底清除</span>
            </div>
            {deleted.map((entity) => (
              <div key={entity.id} {...stylex.props(styles.deletedRow)}>
                <span {...stylex.props(styles.deletedTitle)}>{entity.title}</span>
                <Button icon={Undo2Icon} size={'small'} type={'text'} onClick={() => restore(entity.id)}>
                  恢复
                </Button>
              </div>
            ))}
          </section>
        )}
      </div>
    </aside>
  );
});

EntityList.displayName = 'EntityList';

export default EntityList;
