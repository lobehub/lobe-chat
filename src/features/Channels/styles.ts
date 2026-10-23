import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';

export const styles = stylex.create({
  page: { display: 'flex', flex: '1', minHeight: 0, minWidth: 0, flexDirection: 'column' },
  heading: { margin: 0, fontSize: 20, fontWeight: 600 },
  muted: { color: cssVar.colorTextSecondary, fontSize: 13 },
  error: { color: cssVar.colorError, fontSize: 13 },
  header: {
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: cssVar.colorBorderSecondary,
  },
  timeline: { flex: '1', minHeight: 0, overflowY: 'auto', overflowX: 'hidden' },
  content: {
    width: '100%',
    maxWidth: 960,
    marginInline: 'auto',
    paddingInline: 24,
    paddingBlock: 16,
  },
  composer: { paddingBlock: 12, width: '100%', maxWidth: 960, marginInline: 'auto' },
  panel: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: cssVar.colorBorderSecondary,
    borderRadius: 8,
    padding: 16,
  },
  quote: {
    borderInlineStartWidth: 2,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: cssVar.colorBorder,
    paddingInlineStart: 12,
    color: cssVar.colorTextSecondary,
  },
});
