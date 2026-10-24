import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';

const HOVER = '@media (hover: hover)';

export const styles = stylex.create({
  layout: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    color: cssVar.colorText,
    backgroundColor: cssVar.colorBgContainer,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flex: '1',
    minWidth: 0,
    minHeight: 0,
  },
  conversations: {
    position: 'relative',
    overflow: 'hidden',
    flex: '1',
    minWidth: 0,
    minHeight: 0,
  },
  threadPanel: {
    zIndex: 10,
    flexShrink: 0,
    height: '100%',
    backgroundColor: cssVar.colorBgContainer,
  },
  threadContent: {
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  threadHeader: {
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: cssVar.colorBorderSecondary,
  },
  feed: {
    overflowY: 'auto',
    flex: '1',
    minHeight: 0,
    paddingBlockStart: 8,
    paddingBlockEnd: 24,
  },
  /** Anchors the hover-revealed branch action of one message. */
  messageRow: {
    position: 'relative',
  },
  messageAvatar: {
    position: 'absolute',
    insetBlockStart: 12,
    insetInlineStart: 0,
  },
  branchAction: {
    position: 'absolute',
    insetBlockStart: 12,
    insetInlineEnd: 0,
    zIndex: 1,
    opacity: {
      default: 1,
      [HOVER]: {
        default: 0,
        [stylex.when.ancestor(':hover')]: 1,
        [stylex.when.ancestor(':focus-within')]: 1,
      },
    },
    pointerEvents: {
      default: 'auto',
      [HOVER]: {
        default: 'none',
        [stylex.when.ancestor(':hover')]: 'auto',
        [stylex.when.ancestor(':focus-within')]: 'auto',
      },
    },
  },
  activity: {
    display: 'flex',
    flexWrap: 'wrap',
    flexShrink: 0,
    alignItems: 'center',
    columnGap: 12,
    minHeight: 32,
    paddingBlock: 8,
    fontSize: cssVar.fontSizeSM,
    lineHeight: cssVar.lineHeightSM,
    color: cssVar.colorTextSecondary,
  },
  composer: {
    flexShrink: 0,
    paddingBlockEnd: 8,
  },
  muted: {
    fontSize: 12,
    color: cssVar.colorTextSecondary,
  },
  error: {
    fontSize: 13,
    color: cssVar.colorError,
  },
});

export const statusStyles = stylex.create({
  receipts: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    fontSize: cssVar.fontSizeSM,
  },
  chip: {
    maxWidth: '100%',
    height: 'auto',
    minHeight: 28,
    paddingBlock: 4,
    paddingInline: 8,
    fontSize: cssVar.fontSizeSM,
    whiteSpace: 'normal',
    backgroundColor: cssVar.colorFillQuaternary,
  },
  name: {
    overflow: 'hidden',
    maxWidth: 112,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  state: {
    display: 'inline-flex',
    gap: 4,
    alignItems: 'center',
  },
  dot: {
    flex: 'none',
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: 'currentcolor',
  },
  popover: {
    width: 288,
    maxWidth: 'calc(100vw - 48px)',
    fontSize: cssVar.fontSizeSM,
    color: cssVar.colorText,
    overflowWrap: 'anywhere',
  },
  memberButton: {
    position: 'relative',
    flex: 'none',
    width: 32,
    minWidth: 32,
    height: 32,
    paddingBlock: 4,
    paddingInline: 4,
  },
  memberDot: {
    position: 'absolute',
    insetBlockEnd: 3,
    insetInlineEnd: 3,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: cssVar.colorBgContainer,
    borderRadius: '50%',
  },
});

export const toneStyles = stylex.create({
  attention: { color: cssVar.colorWarning },
  done: { color: cssVar.colorTextSecondary },
  error: { color: cssVar.colorError },
  quiet: { color: cssVar.colorTextSecondary },
  working: { color: cssVar.colorInfo },
});
