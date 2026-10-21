import { ActionIcon, Button, TextArea } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { PencilIcon } from 'lucide-react';
import { memo, useState } from 'react';

import { formatAgo } from '../derive';
import { useEntityDemoStore } from '../store';
import { type MemoryEntity } from '../types';
import Section from './Section';

const styles = stylex.create({
  text: {
    color: cssVar.colorText,
    fontSize: '17px',
    lineHeight: '28px',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  foot: {
    alignItems: 'center',
    color: cssVar.colorTextTertiary,
    display: 'flex',
    fontSize: '12px',
    gap: '4px',
    marginBlockStart: '-4px',
  },
  editActions: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
});

interface NowSectionProps {
  entity: MemoryEntity;
}

/**
 * The one sentence that is overwritten as things change. Older wording is not lost: it is what
 * the timeline below records.
 */
const NowSection = memo<NowSectionProps>(({ entity }) => {
  const updateNow = useEntityDemoStore((s) => s.updateNow);
  const [draft, setDraft] = useState<string>();
  const editing = draft !== undefined;

  const save = () => {
    const next = draft?.trim();
    if (next && next !== entity.now) updateNow(entity.id, next);
    setDraft(undefined);
  };

  return (
    <Section title={'现在'}>
      {editing ? (
        <>
          <TextArea
            autoFocus
            autoSize={{ maxRows: 8, minRows: 2 }}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setDraft(undefined);
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save();
            }}
          />
          <div {...stylex.props(styles.editActions)}>
            <Button size={'small'} onClick={() => setDraft(undefined)}>
              取消
            </Button>
            <Button size={'small'} type={'primary'} onClick={save}>
              保存
            </Button>
          </div>
        </>
      ) : (
        <>
          <p {...stylex.props(styles.text)}>{entity.now}</p>
          <div {...stylex.props(styles.foot)}>
            <span>
              {entity.nowEditedBy === 'user' ? '你修改于' : '根据对话更新于'}{' '}
              {formatAgo(entity.nowUpdatedAt)}
            </span>
            <ActionIcon
              aria-label={'修改现状'}
              icon={PencilIcon}
              size={'small'}
              title={'修改现状'}
              onClick={() => setDraft(entity.now)}
            />
          </div>
        </>
      )}
    </Section>
  );
});

NowSection.displayName = 'NowSection';

export default NowSection;
