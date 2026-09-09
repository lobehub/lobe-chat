import { sha256 } from 'js-sha256';
import { describe, expect, it, vi } from 'vitest';

import { copyWorkspaceHtmlArtifactIntoWorkspace } from './copyWorkspaceHtmlArtifactIntoWorkspace';

const escaped = (absolutePath: string, href: string) => ({ absolutePath, href });

describe('copyWorkspaceHtmlArtifactIntoWorkspace', () => {
  it('copies the HTML entry and same-directory resources without rewriting hrefs', async () => {
    const copyFile = vi.fn().mockResolvedValue(undefined);
    const htmlContent = '<html><img src="logo.png"></html>';

    const result = await copyWorkspaceHtmlArtifactIntoWorkspace({
      copyFile,
      escaped: [escaped('/tmp/site/logo.png', 'logo.png')],
      htmlContent,
      htmlFilePath: '/tmp/site/index.html',
      workingDirectory: '/project',
    });

    expect(result.entryPath).toBe(`${result.targetDirectory}/index.html`);
    expect(result.htmlContent).toBe(htmlContent);
    expect(result.failed).toEqual([]);
    expect(copyFile.mock.calls).toEqual([
      ['/tmp/site/index.html', result.entryPath],
      ['/tmp/site/logo.png', `${result.targetDirectory}/logo.png`],
    ]);
  });

  it('moves parent escapes under a path hash and rewrites their hrefs', async () => {
    const copyFile = vi.fn().mockResolvedValue(undefined);
    const source = '/tmp/shared/logo.png';
    const result = await copyWorkspaceHtmlArtifactIntoWorkspace({
      copyFile,
      escaped: [escaped(source, '../shared/logo.png')],
      htmlContent: '<html><img src="../shared/logo.png"></html>',
      htmlFilePath: '/tmp/site/index.html',
      workingDirectory: '/project',
    });
    const relativeTarget = `__external__/${sha256(source).slice(0, 8)}/logo.png`;

    expect(copyFile).toHaveBeenLastCalledWith(
      source,
      `${result.targetDirectory}/${relativeTarget}`,
    );
    expect(result.htmlContent).toBe(`<html><img src="${relativeTarget}"></html>`);
  });

  it('keeps external entry identifiers distinct and canonical', async () => {
    const input = {
      copyFile: vi.fn().mockResolvedValue(undefined),
      escaped: [],
      htmlContent: '<html></html>',
      workingDirectory: '/project',
    };

    const siteA = await copyWorkspaceHtmlArtifactIntoWorkspace({
      ...input,
      htmlFilePath: '/tmp/site-a/index.html',
    });
    const siteARepeat = await copyWorkspaceHtmlArtifactIntoWorkspace({
      ...input,
      htmlFilePath: '/tmp/site-a/index.html',
    });
    const privateSiteA = await copyWorkspaceHtmlArtifactIntoWorkspace({
      ...input,
      htmlFilePath: '/private/tmp/site-a/index.html',
    });
    const siteB = await copyWorkspaceHtmlArtifactIntoWorkspace({
      ...input,
      htmlFilePath: '/tmp/site-b/index.html',
    });

    expect(siteA.targetDirectory).toBe(siteARepeat.targetDirectory);
    expect(siteA.targetDirectory).toBe(privateSiteA.targetDirectory);
    expect(siteA.targetDirectory).not.toBe(siteB.targetDirectory);
  });

  it('moves parent escapes with mixed separators under __external__', async () => {
    const copyFile = vi.fn().mockResolvedValue(undefined);
    const source = '/tmp/site\\nested\\..\\shared\\logo.png';

    const result = await copyWorkspaceHtmlArtifactIntoWorkspace({
      copyFile,
      escaped: [escaped(source, '..\\shared\\logo.png')],
      htmlContent: '<html><img src="..\\shared\\logo.png"></html>',
      htmlFilePath: '/tmp/site\\nested/index.html',
      workingDirectory: '/project',
    });

    expect(copyFile.mock.calls[1][1]).toContain('/__external__/');
    expect(result.htmlContent).toContain('__external__/');
  });

  it('returns resource copy failures without dropping successful copies', async () => {
    const copyFile = vi.fn(async (from: string) => {
      if (from.endsWith('gone.png')) throw new Error('gone');
    });
    const failedRef = escaped('/tmp/site/gone.png', 'gone.png');

    const result = await copyWorkspaceHtmlArtifactIntoWorkspace({
      copyFile,
      escaped: [escaped('/tmp/site/ok.png', 'ok.png'), failedRef],
      htmlContent: '<html><img src="ok.png"><img src="gone.png"></html>',
      htmlFilePath: '/tmp/site/index.html',
      workingDirectory: '/project',
    });

    expect(result.failed).toEqual([failedRef]);
    expect(copyFile).toHaveBeenCalledTimes(3);
  });
});
