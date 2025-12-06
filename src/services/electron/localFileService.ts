import {
  EditLocalFileParams,
  EditLocalFileResult,
  GetCommandOutputParams,
  GetCommandOutputResult,
  GlobFilesParams,
  GlobFilesResult,
  GrepContentParams,
  GrepContentResult,
  KillCommandParams,
  KillCommandResult,
  ListLocalFileParams,
  LocalFileItem,
  LocalMoveFilesResultItem,
  LocalReadFileParams,
  LocalReadFileResult,
  LocalReadFilesParams,
  LocalSearchFilesParams,
  MoveLocalFilesParams,
  OpenLocalFileParams,
  OpenLocalFolderParams,
  RenameLocalFileParams,
  RunCommandParams,
  RunCommandResult,
  WriteLocalFileParams,
} from '@lobechat/electron-client-ipc';
import { ensureElectronIpc } from '@/utils/electron/ipc';

class LocalFileService {
  // File Operations
  async listLocalFiles(params: ListLocalFileParams): Promise<LocalFileItem[]> {
    return ensureElectronIpc().localSystem.listLocalFiles(params);
  }

  async readLocalFile(params: LocalReadFileParams): Promise<LocalReadFileResult> {
    return ensureElectronIpc().localSystem.readLocalFile(params);
  }

  async readLocalFiles(params: LocalReadFilesParams): Promise<LocalReadFileResult[]> {
    return ensureElectronIpc().localSystem.readLocalFiles(params);
  }

  async searchLocalFiles(params: LocalSearchFilesParams): Promise<LocalFileItem[]> {
    return ensureElectronIpc().localSystem.searchLocalFiles(params);
  }

  async openLocalFile(params: OpenLocalFileParams) {
    return ensureElectronIpc().localSystem.openLocalFile(params);
  }

  async openLocalFolder(params: OpenLocalFolderParams) {
    return ensureElectronIpc().localSystem.openLocalFolder(params);
  }

  async moveLocalFiles(params: MoveLocalFilesParams): Promise<LocalMoveFilesResultItem[]> {
    return ensureElectronIpc().localSystem.moveLocalFiles(params);
  }

  async renameLocalFile(params: RenameLocalFileParams) {
    return ensureElectronIpc().localSystem.renameLocalFile(params);
  }

  async writeFile(params: WriteLocalFileParams) {
    return ensureElectronIpc().localSystem.writeLocalFile(params);
  }

  async editLocalFile(params: EditLocalFileParams): Promise<EditLocalFileResult> {
    return ensureElectronIpc().localSystem.editLocalFile(params);
  }

  // Shell Commands
  async runCommand(params: RunCommandParams): Promise<RunCommandResult> {
    return ensureElectronIpc().shellCommand.runCommand(params);
  }

  async getCommandOutput(params: GetCommandOutputParams): Promise<GetCommandOutputResult> {
    return ensureElectronIpc().shellCommand.getCommandOutput(params);
  }

  async killCommand(params: KillCommandParams): Promise<KillCommandResult> {
    return ensureElectronIpc().shellCommand.killCommand(params);
  }

  // Search & Find
  async grepContent(params: GrepContentParams): Promise<GrepContentResult> {
    return ensureElectronIpc().localSystem.grepContent(params);
  }

  async globFiles(params: GlobFilesParams): Promise<GlobFilesResult> {
    return ensureElectronIpc().localSystem.globLocalFiles(params);
  }

  // Helper methods
  async openLocalFileOrFolder(path: string, isDirectory: boolean) {
    if (isDirectory) {
      return this.openLocalFolder({ isDirectory, path });
    } else {
      return this.openLocalFile({ path });
    }
  }

  async openFileFolder(path: string) {
    return this.openLocalFolder({ isDirectory: false, path });
  }
}

export const localFileService = new LocalFileService();
