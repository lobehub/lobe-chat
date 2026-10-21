import { Button, Empty, SearchBar } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { SearchXIcon } from 'lucide-react';
import { memo, useMemo, useState } from 'react';

import { useEntityDataContext } from '../context';
import { lastTouchedOf } from '../derive';
import { CONTEXT_KINDS, KIND_META } from '../kinds';
import { useEntityViewStore } from '../store';
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
  noMatch: { paddingBlock: '48px' },
});

const matches = (entity: MemoryEntity, keyword: string) =>
  [entity.title, entity.description, entity.summary, ...entity.tags].some((text) =>
    text.toLowerCase().includes(keyword),
  );

const EntityList = memo(() => {
  const [keyword, setKeyword] = useState('');
  const { entities: contexts, links, truncated } = useEntityDataContext();
  const selectedId = useEntityViewStore((s) => s.selectedId);
  const select = useEntityViewStore((s) => s.select);

  const groups = useMemo(() => {
    const needle = keyword.trim().toLowerCase();
    const visible = (needle ? contexts.filter((e) => matches(e, needle)) : contexts)
      .map((entity) => ({
        entity,
        lastTouchedAt: lastTouchedOf(entity, links),
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
        label: '搁置与已结束',
        muted: true,
      },
    ].filter((group) => group.items.length > 0);
  }, [contexts, links, keyword]);

  return (
    <aside aria-label={'情境列表'} {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.head)}>
        <div {...stylex.props(styles.heading)}>
          <h1 {...stylex.props(styles.title)}>情境</h1>
          <span {...stylex.props(styles.count)}>
            {truncated ? `最近 ${contexts.length} 条` : contexts.length}
          </span>
        </div>
        <SearchBar
          allowClear
          placeholder={'搜索名称、现状或标签'}
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
      </div>
    </aside>
  );
});

EntityList.displayName = 'EntityList';

export default EntityList;
