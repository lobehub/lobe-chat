import {
  type EscapedResourceRef,
  replaceHrefToken,
  workspaceHtmlArtifactIdentifierForFile,
} from '@lobechat/html-artifact';
import { sha256 } from 'js-sha256';
import path from 'path-browserify-esm';

export interface CopyWorkspaceHtmlArtifactResult {
  entryPath: string;
  failed: EscapedResourceRef[];
  htmlContent: string;
  targetDirectory: string;
}

export const copyWorkspaceHtmlArtifactIntoWorkspace = async ({
  copyFile,
  escaped,
  htmlContent,
  htmlFilePath,
  workingDirectory,
}: {
  copyFile: (from: string, to: string) => Promise<void>;
  escaped: EscapedResourceRef[];
  htmlContent: string;
  htmlFilePath: string;
  workingDirectory: string;
}): Promise<CopyWorkspaceHtmlArtifactResult> => {
  const pathApi = (workingDirectory.includes('\\') ? path.win32 : path.posix)!;
  const identifier = workspaceHtmlArtifactIdentifierForFile(htmlFilePath, workingDirectory);
  const targetDirectory = pathApi.join(workingDirectory, '.lobe-artifacts', identifier);
  const entryPath = pathApi.join(targetDirectory, pathApi.basename(htmlFilePath));
  const htmlDirectory = pathApi.dirname(htmlFilePath);
  const failed: EscapedResourceRef[] = [];
  let copiedHtml = htmlContent;

  await copyFile(htmlFilePath, entryPath);

  for (const ref of escaped) {
    const relativePath = pathApi.relative(htmlDirectory, ref.absolutePath);
    const keepsLayout =
      relativePath !== '' &&
      relativePath !== '..' &&
      !relativePath.startsWith(`..${pathApi.sep}`) &&
      !pathApi.isAbsolute(relativePath);
    const targetRelativePath = keepsLayout
      ? relativePath
      : pathApi.join(
          '__external__',
          sha256(ref.absolutePath).slice(0, 8),
          pathApi.basename(ref.absolutePath),
        );

    try {
      await copyFile(ref.absolutePath, pathApi.join(targetDirectory, targetRelativePath));
      if (!keepsLayout) {
        const suffix = ref.href.match(/[?#].*$/u)?.[0] ?? '';
        copiedHtml = replaceHrefToken(
          copiedHtml,
          ref.href,
          `${targetRelativePath.replaceAll('\\', '/')}${suffix}`,
        );
      }
    } catch {
      failed.push(ref);
    }
  }

  return { entryPath, failed, htmlContent: copiedHtml, targetDirectory };
};
