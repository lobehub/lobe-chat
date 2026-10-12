import { describe, expect, it, vi } from 'vitest';

import { ActivatorExecutionRuntime, type ToolManifestInfo } from '../index';

const webBrowsingManifest: ToolManifestInfo = {
  apiDescriptions: [
    { description: 'Search the web.', name: 'search' },
    { description: 'Crawl one page.', name: 'crawlSinglePage' },
  ],
  identifier: 'lobe-web-browsing',
  name: 'Web Browsing',
};

const buildService = (manifests: ToolManifestInfo[]) => ({
  getActivatedToolIds: vi.fn(() => [] as string[]),
  getToolManifests: vi.fn(async (identifiers: string[]) =>
    manifests.filter((m) => identifiers.includes(m.identifier)),
  ),
  markActivated: vi.fn(),
});

describe('ActivatorExecutionRuntime.activateTools — request-name resolution', () => {
  it('resolves a wire name (identifier____apiName) to the plugin identifier', async () => {
    const service = buildService([webBrowsingManifest]);
    const runtime = new ActivatorExecutionRuntime({ service });

    const result = await runtime.activateTools({
      identifiers: ['lobe-web-browsing____search'],
      reason: 'test',
    });

    expect(result.content).toContain('Successfully activated tools: lobe-web-browsing.search');
    expect(result.state?.notFound).toEqual([]);
    expect(service.markActivated).toHaveBeenCalledWith(['lobe-web-browsing']);
  });

  it('resolves a bare API name when the manifests were returned for the request', async () => {
    // The host's getToolManifests only matches plugin identifiers, so a bare
    // API name gets no manifests back — the resolver then passes it through.
    // This pins that behavior: bare names resolve only when the host returns
    // the manifest for them.
    const service = {
      getActivatedToolIds: vi.fn(() => [] as string[]),
      getToolManifests: vi.fn(async (identifiers: string[]) =>
        identifiers.includes('lobe-web-browsing') ? [webBrowsingManifest] : [],
      ),
      markActivated: vi.fn(),
    };
    const runtime = new ActivatorExecutionRuntime({ service });

    const result = await runtime.activateTools({
      identifiers: ['lobe-web-browsing'],
      reason: 'test',
    });

    expect(result.content).toContain('Successfully activated tools: lobe-web-browsing.search');
  });

  it('resolves a wire name whose api segment is MD5-compressed to the identifier prefix', async () => {
    const service = buildService([webBrowsingManifest]);
    const runtime = new ActivatorExecutionRuntime({ service });

    const result = await runtime.activateTools({
      identifiers: ['lobe-web-browsing____MD5HASH_abc123def456'],
      reason: 'test',
    });

    expect(result.content).toContain('Successfully activated tools: lobe-web-browsing.search');
    expect(result.state?.notFound).toEqual([]);
  });

  it('still returns Not found for a name that matches no manifest', async () => {
    const service = buildService([webBrowsingManifest]);
    const runtime = new ActivatorExecutionRuntime({ service });

    const result = await runtime.activateTools({
      identifiers: ['totally-unknown-tool'],
      reason: 'test',
    });

    expect(result.content).toContain('Not found: totally-unknown-tool');
    expect(result.state?.notFound).toEqual(['totally-unknown-tool']);
  });

  it('does not resolve an ambiguous bare API name shared by two manifests', async () => {
    const otherManifest: ToolManifestInfo = {
      apiDescriptions: [{ description: 'Search something else.', name: 'search' }],
      identifier: 'other-tool',
      name: 'Other Tool',
    };
    const service = buildService([webBrowsingManifest, otherManifest]);
    const runtime = new ActivatorExecutionRuntime({ service });

    const result = await runtime.activateTools({ identifiers: ['search'], reason: 'test' });

    expect(result.content).toContain('Not found: search');
  });

  it('reports already-active for a wire name whose plugin is already activated', async () => {
    const service = buildService([webBrowsingManifest]);
    service.getActivatedToolIds.mockReturnValue(['lobe-web-browsing']);
    const runtime = new ActivatorExecutionRuntime({ service });

    const result = await runtime.activateTools({
      identifiers: ['lobe-web-browsing____search'],
      reason: 'test',
    });

    expect(result.content).toContain('Already active: lobe-web-browsing');
    expect(result.state?.notFound).toEqual([]);
  });

  it('keeps the exact plugin identifier working unchanged', async () => {
    const service = buildService([webBrowsingManifest]);
    const runtime = new ActivatorExecutionRuntime({ service });

    const result = await runtime.activateTools({
      identifiers: ['lobe-web-browsing'],
      reason: 'test',
    });

    expect(result.content).toContain('Successfully activated tools: lobe-web-browsing.search');
  });

  it('deduplicates identifiers when one request carries two wire names of the same plugin', async () => {
    // Vent scenario (Codex P2 on PR #20791): the model asks for two APIs of
    // the same plugin; both resolve to one identifier, and without dedup the
    // response would list the plugin (and its manifests/React keys) twice.
    const service = buildService([webBrowsingManifest]);
    const runtime = new ActivatorExecutionRuntime({ service });

    const result = await runtime.activateTools({
      identifiers: ['lobe-web-browsing____search', 'lobe-web-browsing____crawlSinglePage'],
      reason: 'test',
    });

    expect(service.markActivated).toHaveBeenCalledTimes(1);
    expect(service.markActivated).toHaveBeenCalledWith(['lobe-web-browsing']);
    const occurrences = (result.content.match(/lobe-web-browsing\.search/g) ?? []).length;
    expect(occurrences).toBe(1);
    expect(result.state?.notFound).toEqual([]);
  });
});
