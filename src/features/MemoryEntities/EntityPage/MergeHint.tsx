import { Button, Icon } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { CombineIcon } from 'lucide-react';
import { memo } from 'react';

import { openMergeModal } from '../actions';
import { useEntityDemoStore } from '../store';

const styles = stylex.create({
  root: {
    alignItems: 'center',
    backgroundColor: cssVar.colorFillQuaternary,
    borderRadius: cssVar.borderRadiusLG,
    display: 'flex',
    gap: '12px',
    paddingBlock: '12px',
    paddingInlineEnd: '12px',
    paddingInlineStart: '16px',
  },
  icon: { color: cssVar.colorTextTertiary, display: 'flex' },
  text: { display: 'flex', flex: '1', flexDirection: 'column', gap: '2px', minWidth: 0 },
  main: { fontSize: '13px' },
  reason: { color: cssVar.colorTextTertiary, fontSize: '12px' },
});

interface MergeHintProps {
  entityId: string;
}

/**
 * When extraction is unsure, it creates a new page and asks here instead of merging silently:
 * a wrong merge costs more than a duplicate.
 */
const MergeHint = memo<MergeHintProps>(({ entityId }) => {
  const suggestion = useEntityDemoStore((s) =>
    s.suggestions.find((item) => item.fromId === entityId || item.intoId === entityId),
  );
  const other = useEntityDemoStore((s) =>
    s.entities.find(
      (e) => suggestion && e.id === (suggestion.fromId === entityId ? suggestion.intoId : suggestion.fromId),
    ),
  );
  const dismiss = useEntityDemoStore((s) => s.dismissSuggestion);
  if (!suggestion || !other) return null;

  return (
    <div role={'note'} {...stylex.props(styles.root)}>
      <span {...stylex.props(styles.icon)}>
        <Icon icon={CombineIcon} size={16} />
      </span>
      <div {...stylex.props(styles.text)}>
        <span {...stylex.props(styles.main)}>可能和「{other.title}」是同一件事</span>
        <span {...stylex.props(styles.reason)}>{suggestion.reason}</span>
      </div>
      <Button size={'small'} type={'text'} onClick={() => dismiss(suggestion.fromId)}>
        不是
      </Button>
      <Button
        size={'small'}
        onClick={() => openMergeModal(suggestion.fromId, suggestion.intoId)}
      >
        合并…
      </Button>
    </div>
  );
});

MergeHint.displayName = 'MergeHint';

export default MergeHint;
