import {
  Button,
  createModal,
  ModalFooter,
  Select,
  toast,
  useModalContext,
} from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { memo, useState } from 'react';

import KindIcon from './components/KindIcon';
import { activitiesOf, isPerson } from './derive';
import { KIND_META } from './kinds';
import { useEntityDemoStore } from './store';

const UNDO_DURATION = 10_000;

const styles = stylex.create({
  body: { display: 'flex', flexDirection: 'column', gap: '16px', paddingBlockEnd: '8px' },
  label: { color: cssVar.colorTextSecondary, fontSize: '13px', marginBlockEnd: '6px' },
  preview: {
    backgroundColor: cssVar.colorFillQuaternary,
    borderRadius: cssVar.borderRadiusLG,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingBlock: '12px',
    paddingInline: '16px',
  },
  previewHead: { alignItems: 'center', display: 'flex', gap: '12px' },
  previewTitle: { fontSize: '15px', fontWeight: 600 },
  previewRow: { color: cssVar.colorTextSecondary, fontSize: '13px', lineHeight: '20px' },
  previewKey: { color: cssVar.colorTextTertiary, display: 'inline-block', width: '56px' },
});

interface MergeContentProps {
  fromId: string;
  intoId?: string;
}

/**
 * Shows the result before it happens: which name survives, which become aliases and how many
 * timeline entries move. Merging only rewrites links, so it can always be undone.
 */
const MergeContent = memo<MergeContentProps>(({ fromId, intoId: initialInto }) => {
  const { close } = useModalContext();
  const entities = useEntityDemoStore((s) => s.entities);
  const activities = useEntityDemoStore((s) => s.activities);
  const deletedIds = useEntityDemoStore((s) => s.deletedIds);
  const merge = useEntityDemoStore((s) => s.merge);
  const restoreSnapshot = useEntityDemoStore((s) => s.restoreSnapshot);
  const [intoId, setIntoId] = useState(initialInto);

  const from = entities.find((e) => e.id === fromId);
  const into = entities.find((e) => e.id === intoId);
  if (!from) return null;

  const candidates = entities.filter(
    (e) => e.id !== fromId && !isPerson(e.kind) && !deletedIds.includes(e.id),
  );
  const moved = activitiesOf(activities, fromId).length;

  const handleMerge = () => {
    if (!into) return;
    const snapshot = merge(from.id, into.id);
    close();
    toast.success({
      actions: [{ label: '撤销', onClick: () => restoreSnapshot(snapshot) }],
      duration: UNDO_DURATION,
      title: `已把「${from.title}」并入「${into.title}」`,
    });
  };

  return (
    <>
      <div {...stylex.props(styles.body)}>
        <div>
          <div {...stylex.props(styles.label)}>并入</div>
          <Select
            placeholder={'选择保留的情境'}
            style={{ width: '100%' }}
            value={intoId}
            options={candidates.map((e) => ({
              label: `${e.title} · ${KIND_META[e.kind].label}`,
              value: e.id,
            }))}
            onChange={(value) => setIntoId(value as string)}
          />
        </div>
        {into && (
          <div {...stylex.props(styles.preview)}>
            <div {...stylex.props(styles.previewHead)}>
              <KindIcon kind={into.kind} />
              <span {...stylex.props(styles.previewTitle)}>{into.title}</span>
            </div>
            <div {...stylex.props(styles.previewRow)}>
              <span {...stylex.props(styles.previewKey)}>别名</span>
              {[...into.aliases, from.title, ...from.aliases].join('、')}
            </div>
            <div {...stylex.props(styles.previewRow)}>
              <span {...stylex.props(styles.previewKey)}>现在</span>
              保留「{into.title}」的现状
            </div>
            <div {...stylex.props(styles.previewRow)}>
              <span {...stylex.props(styles.previewKey)}>经过</span>
              {moved} 条经过移到这一页
            </div>
          </div>
        )}
      </div>
      <ModalFooter>
        <Button onClick={() => close()}>取消</Button>
        <Button disabled={!into} type={'primary'} onClick={handleMerge}>
          合并
        </Button>
      </ModalFooter>
    </>
  );
});

MergeContent.displayName = 'MergeContent';

export const openMergeModal = (fromId: string, intoId?: string) => {
  const from = useEntityDemoStore.getState().entities.find((e) => e.id === fromId);
  createModal({
    content: <MergeContent fromId={fromId} intoId={intoId} />,
    footer: null,
    maskClosable: true,
    title: `把「${from?.title}」并入另一个情境`,
    width: 480,
  });
};

/**
 * No confirmation dialog: deleting is immediate, the toast offers undo for 10 seconds and the
 * page stays in 最近删除 after that.
 */
export const deleteEntity = (id: string) => {
  const { entities, remove, restoreSnapshot, select } = useEntityDemoStore.getState();
  const entity = entities.find((e) => e.id === id);
  if (!entity) return;

  const snapshot = remove(id);
  const { deletedIds } = useEntityDemoStore.getState();
  // Land on the next page instead of an empty pane.
  const next = entities.find(
    (e) => !isPerson(e.kind) && e.status === 'active' && !deletedIds.includes(e.id),
  );
  select(next?.id);

  toast.info({
    actions: [
      {
        label: '撤销',
        onClick: () => {
          restoreSnapshot(snapshot);
          select(id);
        },
      },
    ],
    description: '可以在列表底部的「最近删除」里恢复',
    duration: UNDO_DURATION,
    title: `已删除「${entity.title}」`,
  });
};
