import { bytesToBase64 } from '@lobechat/utils';

import {
  type CollectedLocalResourceRef,
  collectLocalResourceRefs,
  isCssAssetPath,
  isJsAssetPath,
  type LocalResourceSkipReason,
} from './collectHtmlLocalResources';
import { extractHtmlTitle } from './htmlTagScanner';
import {
  type ReadWorkspaceAssetResult,
  WORKSPACE_HTML_ARTIFACT_MAX_FILES,
  WORKSPACE_HTML_ARTIFACT_MAX_TOTAL_BYTES,
} from './limits';
import type { WorkspaceHtmlArtifactFile } from './workspaceHtmlArtifact';
import {
  lowestCommonAncestorDirectory,
  parentDirectory,
  toWorkspaceAbsolutePath,
  toWorkspaceRelativePath,
  workspaceHtmlArtifactIdentifierForFile,
} from './workspaceHtmlPath';

export interface GatheredWorkspaceHtmlArtifact {
  blocked?: 'too-large' | 'too-many';
  entryPath: string;
  files: WorkspaceHtmlArtifactFile[];
  identifier: string;
  missing: string[];
  oversized: string[];
  remotes: string[];
  title: string;
  totalBytes: number;
  unsupported: string[];
}

const READ_CONCURRENCY = 5;

const isWalkableAssetPath = (absolutePath: string): boolean =>
  isCssAssetPath(absolutePath) || isJsAssetPath(absolutePath);

const toArtifactFile = (
  relativePath: string,
  contentType: string,
  bytes: Uint8Array,
  text?: string,
): WorkspaceHtmlArtifactFile => {
  if (text !== undefined) {
    return {
      content: text,
      contentType,
      encoding: 'utf8',
      path: relativePath,
    };
  }

  return {
    content: bytesToBase64(bytes),
    contentType,
    encoding: 'base64',
    path: relativePath,
  };
};

export const gatherWorkspaceHtmlArtifact = async ({
  htmlContent,
  htmlFilePath,
  readAsset,
  workingDirectory,
}: {
  htmlContent: string;
  htmlFilePath: string;
  readAsset: (absolutePath: string) => Promise<ReadWorkspaceAssetResult>;
  workingDirectory: string;
}): Promise<GatheredWorkspaceHtmlArtifact> => {
  const absoluteHtmlPath = toWorkspaceAbsolutePath(htmlFilePath, workingDirectory);
  const htmlRefs = collectLocalResourceRefs({
    content: htmlContent,
    sourceKind: 'html',
    sourcePath: absoluteHtmlPath,
    workingDirectory,
  });

  const pending = [...htmlRefs.refs];
  const seen = new Set(pending.map((ref) => ref.absolutePath));
  const handled = new Set<string>();
  const walkQueue = pending.filter((ref) => isWalkableAssetPath(ref.absolutePath));
  const missing: string[] = [];
  const oversized: string[] = [];
  const remotes: string[] = [];
  const unsupported: string[] = [];
  const htmlDirectory = parentDirectory(absoluteHtmlPath);

  const bucketForSkipReason = (reason: LocalResourceSkipReason): string[] | undefined => {
    if (reason === 'remote') return remotes;
    if (reason === 'escape') return missing;
    if (reason === 'extension') return unsupported;
    return;
  };

  const collectSkipped = (skipped: typeof htmlRefs.skipped) => {
    for (const item of skipped) {
      const bucket = bucketForSkipReason(item.reason);
      if (!bucket || bucket.includes(item.href)) continue;
      bucket.push(item.href);
    }
  };

  collectSkipped(htmlRefs.skipped);
  const resolvedAssets: Array<{
    absolutePath: string;
    bytes: Uint8Array;
    contentType: string;
    text?: string;
  }> = [];

  const htmlBytes = new TextEncoder().encode(htmlContent);
  let totalBytes = htmlBytes.byteLength;
  let blocked: GatheredWorkspaceHtmlArtifact['blocked'] =
    totalBytes > WORKSPACE_HTML_ARTIFACT_MAX_TOTAL_BYTES ? 'too-large' : undefined;

  const registerAsset = (asset: (typeof resolvedAssets)[number]) => {
    resolvedAssets.push(asset);
    totalBytes += asset.bytes.byteLength;
    if (resolvedAssets.length + 1 > WORKSPACE_HTML_ARTIFACT_MAX_FILES) blocked = 'too-many';
    else if (totalBytes > WORKSPACE_HTML_ARTIFACT_MAX_TOTAL_BYTES) blocked = 'too-large';
  };

  const registerReadFailure = (
    asset: Extract<ReadWorkspaceAssetResult, { ok: false }>,
    href: string,
  ) => {
    if (asset.reason !== 'oversized') {
      missing.push(href);
      return;
    }

    oversized.push(href);
    totalBytes += asset.sizeBytes ?? WORKSPACE_HTML_ARTIFACT_MAX_TOTAL_BYTES + 1;
    blocked = 'too-large';
  };

  const readLeafAsset = async (ref: CollectedLocalResourceRef) => {
    const asset = await readAsset(ref.absolutePath);
    if (!asset.ok) {
      registerReadFailure(asset, ref.href);
      return;
    }

    registerAsset({
      absolutePath: ref.absolutePath,
      bytes: asset.bytes,
      contentType: asset.contentType,
      text: asset.text,
    });
  };

  while (!blocked && walkQueue.length > 0) {
    const walkRef = walkQueue.shift();
    if (!walkRef) break;
    if (handled.has(walkRef.absolutePath)) continue;
    handled.add(walkRef.absolutePath);

    const asset = await readAsset(walkRef.absolutePath);
    if (!asset.ok) {
      registerReadFailure(asset, walkRef.href);
      continue;
    }

    const text =
      asset.text ??
      (isWalkableAssetPath(walkRef.absolutePath)
        ? new TextDecoder().decode(asset.bytes)
        : undefined);

    registerAsset({
      absolutePath: walkRef.absolutePath,
      bytes: asset.bytes,
      contentType: asset.contentType,
      text,
    });

    if (!text) continue;

    const nested = collectLocalResourceRefs({
      content: text,
      rootDirectory: isJsAssetPath(walkRef.absolutePath) ? htmlDirectory : undefined,
      sourceKind: isJsAssetPath(walkRef.absolutePath) ? 'js' : 'css',
      sourcePath: walkRef.absolutePath,
      workingDirectory,
    });
    collectSkipped(nested.skipped);

    for (const ref of nested.refs) {
      if (seen.has(ref.absolutePath)) continue;
      seen.add(ref.absolutePath);
      pending.push(ref);
      if (isWalkableAssetPath(ref.absolutePath)) walkQueue.push(ref);
    }
  }

  // Leaf assets are independent reads; batch them so remote transports
  // (sandbox runCommand round trips) don't serialize into seconds.
  const leaves = pending.filter((ref) => {
    if (handled.has(ref.absolutePath)) return false;
    handled.add(ref.absolutePath);
    return true;
  });

  for (let index = 0; index < leaves.length && !blocked; index += READ_CONCURRENCY) {
    await Promise.all(leaves.slice(index, index + READ_CONCURRENCY).map(readLeafAsset));
  }

  const siteRoot = lowestCommonAncestorDirectory(
    [absoluteHtmlPath, ...resolvedAssets.map((asset) => asset.absolutePath)],
    workingDirectory,
  );
  const entryPath = toWorkspaceRelativePath(absoluteHtmlPath, siteRoot) || 'index.html';
  const filename = htmlFilePath.split(/[/\\]/).at(-1) || 'index.html';

  const files: WorkspaceHtmlArtifactFile[] = blocked
    ? []
    : [
        toArtifactFile(entryPath, 'text/html', htmlBytes, htmlContent),
        ...resolvedAssets.map((asset) =>
          toArtifactFile(
            toWorkspaceRelativePath(asset.absolutePath, siteRoot),
            asset.contentType,
            asset.bytes,
            asset.text,
          ),
        ),
      ];

  return {
    blocked,
    entryPath,
    files,
    identifier: workspaceHtmlArtifactIdentifierForFile(htmlFilePath, workingDirectory),
    missing,
    oversized,
    remotes,
    title: extractHtmlTitle(htmlContent) || filename,
    totalBytes,
    unsupported,
  };
};
