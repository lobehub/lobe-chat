import { describe, expect, it } from 'vitest';

import { QUICK_NOTE_DISCOVERY, QUICK_NOTE_DIVE } from '.';

/** @example Quick Note agents expose deliberately different capability surfaces. */
describe('Quick Note built-in agents', () => {
  /** @example Background Discovery cannot delegate or execute domain actions. */
  it('keeps Discovery lightweight and tool-free', () => {
    const runtime =
      typeof QUICK_NOTE_DISCOVERY.runtime === 'function'
        ? QUICK_NOTE_DISCOVERY.runtime({ plugins: ['unexpected'] })
        : QUICK_NOTE_DISCOVERY.runtime;

    /** @example Discovery ignores inherited plugins to remain projection-only. */
    expect(runtime.plugins).toEqual([]);
    /** @example Discovery uses a custom, non-agentic tool mode. */
    expect(runtime.chatConfig).toMatchObject({ enableAgentMode: false, toolMode: 'custom' });
  });

  /** @example A user-triggered Dive can delegate to an appropriate Domain Agent. */
  it('allows Dive to use the existing agent orchestration tool', () => {
    const runtime =
      typeof QUICK_NOTE_DIVE.runtime === 'function'
        ? QUICK_NOTE_DIVE.runtime({ plugins: [] })
        : QUICK_NOTE_DIVE.runtime;

    /** @example Dive receives the standard callAgent-capable tool surface. */
    expect(runtime.plugins).toContain('lobe-agent');
  });
});
