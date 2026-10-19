import { describe, expect, it } from 'vitest';

import { buildAgentInput } from '../spawn/input/buildAgentInput';
import { buildHeteroExecStdinPayload } from './execStdinPayload';
import { lobeHubCliGuide } from './lobeHubCliGuide';

describe('lobeHubCliGuide', () => {
  it('reaches both Claude Code and Codex on a new device session', async () => {
    const payload = JSON.parse(buildHeteroExecStdinPayload({ isNewSession: true, prompt: 'hi' }));
    const codex = await buildAgentInput('codex', payload);
    const claude = await buildAgentInput('claude-code', payload);

    expect(codex.stdin).toContain('## LobeHub CLI (`lh`)');
    expect(claude.stdin).toContain('## LobeHub CLI (`lh`)');
  });

  it('does not forbid every install or workaround outright', () => {
    expect(lobeHubCliGuide).not.toMatch(/never install it/);
    expect(lobeHubCliGuide).not.toMatch(/do not work around it/);
  });

  it('offers a one-off run of the latest CLI when the installed lh is too old', () => {
    expect(lobeHubCliGuide).toContain('pnpm --package @lobehub/cli@latest dlx lh');
    expect(lobeHubCliGuide).toContain('npx -y -p @lobehub/cli@latest lh');
  });

  it('still forbids a global install and a fresh login', () => {
    expect(lobeHubCliGuide).toMatch(/Do not install, upgrade or replace `lh` globally/);
    expect(lobeHubCliGuide).toContain('never run `lh login`');
  });
});
