import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';

/**
 * Shared chip styles used by every Agent Documents inspector.
 *
 * Inlining these in each inspector means changing the visual language
 * touches 9 files; keeping one source of truth keeps the toolset coherent
 * (e.g. the doc-id chip should look the same whether you Read or Rename).
 */
export const inspectorChipStyles = stylex.create({
  /** Highlighted chip for the primary subject (title, new title, etc.) */
  chip: {
    overflow: 'hidden',
    display: 'inline-flex',
    flexShrink: 1,
    alignItems: 'center',
    minWidth: '0',
    maxWidth: '280px',
    paddingBlock: '2px',
    paddingInline: '8px',
    borderRadius: '999px',
    fontSize: '12px',
    color: cssVar.colorText,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    backgroundColor: cssVar.colorFillTertiary,
    backgroundImage: 'none',
  },
  /** Compact, code-styled chip for raw identifiers */
  idChip: {
    flexShrink: 0,
    paddingBlock: '2px',
    paddingInline: '8px',
    borderRadius: '999px',
    fontFamily: cssVar.fontFamilyCode,
    fontSize: '12px',
    color: cssVar.colorTextSecondary,
    backgroundColor: cssVar.colorFillTertiary,
    backgroundImage: 'none',
  },
  /** Inline middot used between segments */
  separator: { flexShrink: 0, color: cssVar.colorTextQuaternary },
  /** Secondary, lower-contrast chip for metadata (counts, target scope, …) */
  subdued: { flexShrink: 0, fontSize: '12px', color: cssVar.colorTextTertiary },
});

const UUID_LIKE = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

/**
 * Render a friendly short label for a document id. Full UUIDs are noisy in a
 * one-line header; their first 8 chars are unique enough for cross-referencing
 * within a single conversation. Prefixed ids (e.g. `agd_…`) are left intact —
 * they're already short and meaningful.
 */
export const formatDocumentId = (id?: string): string | undefined => {
  if (!id) return undefined;
  return UUID_LIKE.test(id) ? id.slice(0, 8) : id;
};
