import { ActionIcon, Button, TextArea, toast } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { PencilIcon } from 'lucide-react';
import { memo, useState } from 'react';

import { useEntityDataContext } from '../context';
import { formatAgo } from '../derive';
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
  placeholder: { color: cssVar.colorTextTertiary, fontSize: '14px' },
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
  const { updateNow } = useEntityDataContext();
  const [draft, setDraft] = useState<string>();
  const [saving, setSaving] = useState(false);
  const editing = draft !== undefined;

  const save = async () => {
    const next = draft?.trim();
    if (!next || next === entity.description) return setDraft(undefined);
    setSaving(true);
    try {
      await updateNow(entity.id, next);
      setDraft(undefined);
    } catch {
      // Keep the draft so nothing typed is lost.
      toast.error({ title: '没有保存成功，请重试' });
    } finally {
      setSaving(false);
    }
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
            <Button loading={saving} size={'small'} type={'primary'} onClick={save}>
              保存
            </Button>
          </div>
        </>
      ) : (
        <>
          <p {...stylex.props(styles.text, !entity.description && styles.placeholder)}>
            {entity.description || '还没有记下现在的情况。'}
          </p>
          <div {...stylex.props(styles.foot)}>
            <span>更新于 {formatAgo(entity.updatedAt)}</span>
            <ActionIcon
              aria-label={'修改现状'}
              icon={PencilIcon}
              size={'small'}
              title={'修改现状'}
              onClick={() => setDraft(entity.description)}
            />
          </div>
        </>
      )}
    </Section>
  );
});

NowSection.displayName = 'NowSection';

export default NowSection;
