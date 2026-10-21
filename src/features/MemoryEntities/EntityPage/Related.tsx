import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo } from 'react';

import Avatar from '@/components/Avatar';

import KindIcon from '../components/KindIcon';
import { isPerson, type RelatedEntity } from '../derive';
import { KIND_META } from '../kinds';
import { useEntityDemoStore } from '../store';
import Section from './Section';

const styles = stylex.create({
  grid: {
    display: 'grid',
    gap: '4px',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    marginInline: '-8px',
  },
  item: {
    alignItems: 'center',
    backgroundColor: {
      default: 'transparent',
      ':hover': cssVar.colorFillTertiary,
    },
    borderRadius: cssVar.borderRadius,
    borderStyle: 'none',
    color: cssVar.colorText,
    cursor: 'pointer',
    display: 'flex',
    gap: '12px',
    paddingBlock: '8px',
    paddingInline: '8px',
    textAlign: 'start',
  },
  text: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  name: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '20px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sub: { color: cssVar.colorTextTertiary, fontSize: '12px', lineHeight: '18px' },
});

interface RelatedProps {
  items: RelatedEntity[];
}

/** Not stored anywhere: whatever shares a timeline entry with this page, most frequent first. */
const Related = memo<RelatedProps>(({ items }) => {
  const open = useEntityDemoStore((s) => s.open);
  if (items.length === 0) return null;

  return (
    <Section extra={'从经过里归纳'} title={'相关'}>
      <div {...stylex.props(styles.grid)}>
        {items.map(({ count, entity }) => (
          <button
            key={entity.id}
            type={'button'}
            {...stylex.props(styles.item)}
            onClick={() => open(entity.id)}
          >
            {isPerson(entity.kind) ? (
              <Avatar avatar={undefined} name={entity.title} shape={'circle'} size={24} title={entity.title} />
            ) : (
              <KindIcon kind={entity.kind} />
            )}
            <span {...stylex.props(styles.text)}>
              <span {...stylex.props(styles.name)}>{entity.title}</span>
              <span {...stylex.props(styles.sub)}>
                {entity.relationship ?? KIND_META[entity.kind].label} · 一起出现 {count} 次
              </span>
            </span>
          </button>
        ))}
      </div>
    </Section>
  );
});

Related.displayName = 'EntityRelated';

export default Related;
