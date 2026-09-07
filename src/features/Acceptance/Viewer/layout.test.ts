import { describe, expect, it } from 'vitest';

import {
  acceptanceFocusedLayout,
  acceptanceReportScrollLayout,
  acceptanceScrollLayout,
} from './layout';

describe('acceptanceFocusedLayout', () => {
  it('keeps deliberate reading space above and below focused check content', () => {
    expect(acceptanceFocusedLayout.contentPaddingBlock).toBe('32px 24px');
  });

  it('paces the detail heading and outline rows independently from the outer padding', () => {
    expect(acceptanceFocusedLayout.headerGap).toBe(8);
    expect(acceptanceFocusedLayout.outlineItemPaddingBlock).toBe(10);
    expect(acceptanceFocusedLayout.outlineItemPaddingInline).toBe(8);
  });
});

describe('acceptanceScrollLayout', () => {
  it('keeps one scroll owner for both overview and focused views', () => {
    expect(acceptanceScrollLayout.frameOverflow).toBe('auto');
    expect(acceptanceScrollLayout.paneOverflow).toBe('visible');
  });
});

describe('acceptanceReportScrollLayout', () => {
  it('lets the report viewer shrink inside the drawer and own vertical scrolling', () => {
    expect(acceptanceReportScrollLayout.drawerBodyOverflow).toBe('hidden');
    expect(acceptanceReportScrollLayout.drawerContentOverflow).toBe('hidden');
    expect(acceptanceReportScrollLayout.drawerBodyMinHeight).toBe(0);
    expect(acceptanceReportScrollLayout.paneFlex).toBe(1);
    expect(acceptanceReportScrollLayout.paneMinHeight).toBe(0);
    expect(acceptanceReportScrollLayout.paneOverflow).toBe('hidden');
  });
});
