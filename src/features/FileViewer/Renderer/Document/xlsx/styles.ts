import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';

// The `kv` / `table` descendant rules live in styles.module.css.
export const styles = stylex.create({
  aside: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignItems: 'baseline',
    fontSize: '13px',
  },
  asideLabel: { color: cssVar.colorTextSecondary },
  asideValue: { fontWeight: 500, fontVariantNumeric: 'tabular-nums' },
  chip: {
    paddingBlock: '2px',
    paddingInline: '10px',
    borderRadius: '5px',
    fontSize: '12.5px',
    fontWeight: 500,
    color: cssVar.colorPrimary,
    backgroundColor: cssVar.colorPrimaryBg,
    backgroundImage: 'none',
  },
  container: {
    overflow: 'auto',
    flex: '1',
    backgroundColor: cssVar.colorBgContainer,
    backgroundImage: 'none',
  },
  doc: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    maxWidth: '920px',
    marginInline: 'auto',
    paddingBlockStart: '28px',
    paddingBlockEnd: '44px',
    paddingInline: '32px',
  },
  docHead: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    paddingBlockEnd: '18px',
    borderBlockEndWidth: '1px',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: cssVar.colorBorderSecondary,
  },
  docSubtitle: { fontSize: '13.5px', lineHeight: 1.6, color: cssVar.colorTextSecondary },
  docTitle: {
    fontSize: '24px',
    fontWeight: 600,
    textWrap: 'balance',
    letterSpacing: '-0.015em',
  },
  extra: {
    display: 'block',
    marginBlockStart: '2px',
    fontSize: '11px',
    color: cssVar.colorTextQuaternary,
  },
  hint: { fontSize: '11.5px', lineHeight: 1.6, color: cssVar.colorTextQuaternary },
  section: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sectionHead: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    fontSize: '15px',
    fontWeight: 600,
  },
  sectionRule: {
    flex: '1',
    height: '1px',
    backgroundColor: cssVar.colorBorderSecondary,
    backgroundImage: 'none',
  },
});
