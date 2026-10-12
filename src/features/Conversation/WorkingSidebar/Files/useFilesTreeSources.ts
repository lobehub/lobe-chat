import { useGitWorkingTreeFiles } from './useGitWorkingTreeFiles';
import { useProjectFiles } from './useProjectFiles';

interface FilesTreeSandbox {
  instanceId?: string;
  topicId?: string;
}

/**
 * Everything the Files tree reads: the project index and its git overlay.
 *
 * The overlay is requested alongside the index, not after it. Waiting for the
 * index to say `source: 'git'` put the two reads in series, so the dirty-file
 * colours landed a whole round-trip after the tree. It only stops once the
 * index has settled on a non-git source; the sandbox has no git overlay.
 */
export const useFilesTreeSources = (
  deviceId: string | undefined,
  workingDirectory: string | undefined,
  sandbox?: FilesTreeSandbox,
) => {
  const isSandbox = !!sandbox?.instanceId || !!sandbox?.topicId;
  const project = useProjectFiles(deviceId, workingDirectory, sandbox);
  const source = project.data?.source;
  const git = useGitWorkingTreeFiles(
    deviceId,
    workingDirectory,
    !isSandbox && (source === undefined || source === 'git'),
  );

  return { git, project };
};
