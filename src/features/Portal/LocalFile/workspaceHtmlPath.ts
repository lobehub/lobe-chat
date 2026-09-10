/**
 * Moved to `@lobechat/html-artifact`. Kept as a re-export because the closed
 * business overlay still imports this path; delete once that side migrates.
 */
export {
  createWorkspaceHtmlArtifactIdentifier,
  isPathInsideWorkspace,
  lowestCommonAncestorDirectory,
  parentDirectory,
  resolveLocalResourceHref,
  toWorkspaceAbsolutePath,
  toWorkspaceRelativePath,
  workspaceHtmlArtifactIdentifierForFile,
} from '@lobechat/html-artifact';
