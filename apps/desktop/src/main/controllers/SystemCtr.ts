import { ElectronAppState } from '@lobechat/electron-client-ipc';
import { app, shell, systemPreferences } from 'electron';
import { macOS } from 'electron-is';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

import { DB_SCHEMA_HASH_FILENAME, LOCAL_DATABASE_DIR, userDataDir } from '@/const/dir';
import { LocalRagSrv } from '@/main/services/LocalRagSrv'; // Added for Local RAG

import { ControllerModule, ipcClientEvent, ipcServerEvent } from './index';

export default class SystemController extends ControllerModule {
  private localRagService: LocalRagSrv | undefined;

  async afterAppReady() {
    // Ensure LocalRagSrv is initialized (if not already handled by another controller like RemoteServerSyncCtr)
    // This is a defensive check; ideally, service initialization is centralized or clearly ordered.
    if (!this.localRagService) {
      try {
        this.localRagService = this.app.getService(LocalRagSrv);
        if (this.localRagService) {
          await this.localRagService.ensureDBInitialized();
          console.log('[SystemCtr] LocalRagSrv instance obtained and DB initialized.');
        } else {
          console.error('[SystemCtr] Failed to get LocalRagSrv instance from app services.');
        }
      } catch (error) {
        console.error('[SystemCtr] Error ensuring LocalRagSrv is initialized:', error);
      }
    }
  }
  /**
   * Handles the 'getDesktopAppState' IPC request.
   * Gathers essential application and system information.
   */
  @ipcClientEvent('getDesktopAppState')
  async getAppState(): Promise<ElectronAppState> {
    const platform = process.platform;
    const arch = process.arch;

    return {
      // System Info
      arch,
      isLinux: platform === 'linux',
      isMac: platform === 'darwin',
      isWindows: platform === 'win32',
      platform: platform as 'darwin' | 'win32' | 'linux',
      userPath: {
        // User Paths (ensure keys match UserPathData / DesktopAppState interface)
        desktop: app.getPath('desktop'),
        documents: app.getPath('documents'),
        downloads: app.getPath('downloads'),
        home: app.getPath('home'),
        music: app.getPath('music'),
        pictures: app.getPath('pictures'),
        userData: app.getPath('userData'),
        videos: app.getPath('videos'),
      },
    };
  }

  /**
   * 检查可用性
   */
  @ipcClientEvent('checkSystemAccessibility')
  checkAccessibilityForMacOS() {
    if (!macOS()) return;
    return systemPreferences.isTrustedAccessibilityClient(true);
  }

  @ipcClientEvent('openExternalLink')
  openExternalLink(url: string) {
    return shell.openExternal(url);
  }

  /**
   * 更新应用语言设置
   */
  @ipcClientEvent('updateLocale')
  async updateLocale(locale: string) {
    // 保存语言设置
    this.app.storeManager.set('locale', locale);

    // 更新i18n实例的语言
    await this.app.i18n.changeLanguage(locale === 'auto' ? app.getLocale() : locale);

    return { success: true };
  }

  @ipcServerEvent('getDatabasePath')
  async getDatabasePath() {
    return join(this.app.appStoragePath, LOCAL_DATABASE_DIR);
  }

  @ipcServerEvent('getDatabaseSchemaHash')
  async getDatabaseSchemaHash() {
    try {
      return readFileSync(this.DB_SCHEMA_HASH_PATH, 'utf8');
    } catch {
      return undefined;
    }
  }

  @ipcServerEvent('getUserDataPath')
  async getUserDataPath() {
    return userDataDir;
  }

  @ipcServerEvent('setDatabaseSchemaHash')
  async setDatabaseSchemaHash(hash: string) {
    writeFileSync(this.DB_SCHEMA_HASH_PATH, hash, 'utf8');
  }

  private get DB_SCHEMA_HASH_PATH() {
    return join(this.app.appStoragePath, DB_SCHEMA_HASH_FILENAME);
  }

  // IPC Handler for selecting and processing a file for Local RAG
  @ipcClientEvent('selectAndProcessFileForLocalRag')
  async handleSelectAndProcessFileForLocalRag() {
    // Ensure service is available, attempting re-acquisition if necessary
    if (!this.localRagService) {
      try {
        this.localRagService = this.app.getService(LocalRagSrv);
        await this.localRagService.ensureDBInitialized(); // This line was missing ensureDBInitialized
        console.log('[SystemCtr] Re-acquired and initialized LocalRagSrv for file processing.');
      } catch (serviceError: any) {
        console.error('[SystemCtr] Error re-acquiring or initializing LocalRagSrv for file processing:', serviceError);
        return { success: false, message: `Local RAG service initialization failed: ${serviceError.message}` };
      }
    }
    // If still no service after attempt (e.g. getService returned undefined)
    if (!this.localRagService) {
        console.error('[SystemCtr] LocalRagSrv is definitively not available. Cannot process file.');
        return { success: false, message: 'Local RAG service is not available.' };
    }

    try {
      // The API key is currently a placeholder; it would be fetched from settings if needed.
      const result = await this.localRagService.selectAndProcessFile('local_rag_placeholder_key');
      return result; // This already returns { success, message, ... }
    } catch (error: any) {
      // This catch block might be redundant if selectAndProcessFile itself never throws
      // and always returns a result object. However, it's good for unexpected errors.
      console.error('[SystemCtr] Unexpected error calling selectAndProcessFileForLocalRag:', error);
      return { success: false, message: error.message || 'An unexpected error occurred during file selection or processing.' };
    }
  }

  @ipcClientEvent('listLocalRagDocuments')
  async handleListLocalRagDocuments() {
    if (!this.localRagService) {
       try {
        this.localRagService = this.app.getService(LocalRagSrv);
        await this.localRagService.ensureDBInitialized();
        console.log('[SystemCtr] Re-acquired and initialized LocalRagSrv for listing documents.');
      } catch (serviceError: any) {
        console.error('[SystemCtr] Error re-acquiring or initializing LocalRagSrv for listing documents:', serviceError);
        // For list, returning empty array on error is often preferred by UI
        // But we should also signal that an error occurred if possible, or rely on logs.
        // For now, returning an error structure for consistency might be better if UI can handle it.
        return { success: false, error: `Local RAG service initialization failed: ${serviceError.message}`, data: [] };
      }
    }
    if (!this.localRagService) {
        console.error('[SystemCtr] LocalRagSrv is definitively not available for listing. Cannot list documents.');
        return { success: false, error: 'Local RAG service is not available.', data: [] };
    }

    try {
      const documents = await this.localRagService.listIndexedDocuments();
      // Assuming listIndexedDocuments now throws on error or returns data
      return { success: true, data: documents };
    } catch (error: any) {
      console.error('[SystemCtr] Error listing local RAG documents from service:', error);
      return { success: false, error: error.message || 'Failed to list documents.', data: [] };
    }
  }

  @ipcClientEvent('deleteLocalRagDocument')
  async handleDeleteLocalRagDocument(documentId: string) {
    if (!this.localRagService) {
      try {
        this.localRagService = this.app.getService(LocalRagSrv);
        await this.localRagService.ensureDBInitialized();
        console.log('[SystemCtr] Re-acquired and initialized LocalRagSrv for deleting document.');
      } catch (serviceError: any) {
        console.error('[SystemCtr] Error re-acquiring or initializing LocalRagSrv for deleting document:', serviceError);
        return { success: false, message: `Local RAG service initialization failed: ${serviceError.message}` };
      }
    }
     if (!this.localRagService) {
        console.error('[SystemCtr] LocalRagSrv is definitively not available. Cannot delete document.');
        return { success: false, message: 'Local RAG service is not available.' };
    }

    if (!documentId || typeof documentId !== 'string') {
      console.warn('[SystemCtr] Invalid documentId provided for deletion:', documentId); // Changed to warn
      return { success: false, message: 'Invalid document ID provided.' };
    }

    try {
      await this.localRagService.deleteDocument(documentId);
      console.log(`[SystemCtr] Successfully deleted document with ID: ${documentId}`);
      return { success: true, message: `Document successfully deleted.` }; // Standardized message
    } catch (error: any) {
      console.error(`[SystemCtr] Error deleting document ${documentId} from service:`, error);
      return { success: false, message: error.message || `Failed to delete document ${documentId}.` };
    }
  }
}
