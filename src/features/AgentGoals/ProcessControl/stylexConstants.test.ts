import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { BATCH_FRAME_HEAD } from './Graph/batchLayout';
import { RAIL_ROW, RAIL_TOP } from './useResultAnchorRail';

// StyleX cannot read constants imported from regular modules, so these values are written out in
// `stylex.create`. If a constant changes, the literal has to change with it.
const read = (file: string) => readFileSync(path.join(__dirname, file), 'utf8');

describe('StyleX literals copied from layout constants', () => {
  it('keeps ResultAnchorRail in step with RAIL_TOP and RAIL_ROW', () => {
    const source = read('ResultAnchorRail.tsx');

    expect(source).toContain(`insetBlockStart: '${RAIL_TOP}px'`);
    expect(source).toContain(`height: '${RAIL_ROW}px'`);
    expect(source).toContain(`lineHeight: '${RAIL_ROW}px'`);
    expect(source).toContain(`maxHeight: 'calc(100vh - ${RAIL_TOP * 2}px)'`);
  });

  it('keeps BatchGroups frameHead in step with BATCH_FRAME_HEAD', () => {
    expect(read('Graph/BatchGroups.tsx')).toContain(`height: '${BATCH_FRAME_HEAD}px'`);
  });
});
