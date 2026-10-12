import type { GitWorkingTreeFiles, ProjectFileIndexResult } from '@lobechat/electron-client-ipc';

import { createReplicaSlice, recordLens } from '@/libs/replica';
import { gitService } from '@/services/git';
import { projectFileService } from '@/services/projectFile';
import type { StoreSetter } from '@/store/types';

import { type ProjectFileState } from './initialState';
import {
  type FilesLocation,
  filesLocationResource,
  gitWorkingTreeFilesResource,
  projectIndexResource,
} from './projection';

type Setter = StoreSetter<ProjectFileState>;

export class ProjectFilePrivateAction {
  readonly filesLocation;
  readonly gitWorkingTreeFiles;
  readonly projectIndex;

  constructor(set: Setter, get: () => ProjectFileState) {
    this.projectIndex = createReplicaSlice(projectIndexResource, {
      actionPrefix: 'projectFile/projectIndex',
      fetcher: ({ deviceId, dirPath, sandboxInstanceId, sandboxTopicId }) =>
        projectFileService.getProjectFileIndex({
          deviceId,
          sandboxInstanceId,
          sandboxTopicId,
          scope: dirPath,
        }),
      get,
      // No tree from the host (nothing to read there) clears the saved one.
      isMissing: (incoming) => incoming === undefined,
      set,
      stateKey: 'projectIndexReplica',
      view: recordLens<ProjectFileState, ProjectFileIndexResult>('projectIndex'),
    });
    this.gitWorkingTreeFiles = createReplicaSlice(gitWorkingTreeFilesResource, {
      actionPrefix: 'projectFile/gitWorkingTreeFiles',
      fetcher: ({ deviceId, dirPath }) =>
        gitService.getGitWorkingTreeFiles({ deviceId, path: dirPath }),
      get,
      isMissing: (incoming) => incoming === undefined,
      set,
      stateKey: 'gitWorkingTreeFilesReplica',
      view: recordLens<ProjectFileState, GitWorkingTreeFiles>('gitWorkingTreeFiles'),
    });
    this.filesLocation = createReplicaSlice(filesLocationResource, {
      actionPrefix: 'projectFile/filesLocation',
      get,
      set,
      stateKey: 'filesLocationReplica',
      view: recordLens<ProjectFileState, FilesLocation>('filesLocation'),
    });
  }
}
