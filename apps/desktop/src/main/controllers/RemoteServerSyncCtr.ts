import {
  ProxyTRPCRequestParams,
  ProxyTRPCRequestResult,
} from '@lobechat/electron-client-ipc/src/types/proxyTRPCRequest';
import { Buffer } from 'node:buffer';
import http, { IncomingMessage, OutgoingHttpHeaders } from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

import { LocalRagSrv } from '@/main/services/LocalRagSrv'; // Added for Local RAG
import { createLogger } from '@/utils/logger';

import RemoteServerConfigCtr from './RemoteServerConfigCtr';
import { ControllerModule, ipcClientEvent } from './index';

// Create logger
const logger = createLogger('controllers:RemoteServerSyncCtr');

/**
 * Remote Server Sync Controller
 * For handling data synchronization with remote servers via IPC.
 */
export default class RemoteServerSyncCtr extends ControllerModule {
  /**
   * Cached instance of RemoteServerConfigCtr
   */
  private _remoteServerConfigCtrInstance: RemoteServerConfigCtr | null = null;
  private localRagService: LocalRagSrv | undefined; // Added for Local RAG

  /**
   * Remote server configuration controller
   */
  private get remoteServerConfigCtr() {
    if (!this._remoteServerConfigCtrInstance) {
      this._remoteServerConfigCtrInstance = this.app.getController(RemoteServerConfigCtr);
    }
    return this._remoteServerConfigCtrInstance;
  }

  /**
   * Controller initialization - No specific logic needed here now for request handling
   */
  async afterAppReady() {
    logger.info('RemoteServerSyncCtr initialized (IPC based)');

    // Initialize LocalRagSrv
    try {
      // Important: Ensure LocalRagSrv is registered in the main app's service container
      this.localRagService = this.app.getService(LocalRagSrv);
      if (this.localRagService) {
        // EnsureDBInitialized is critical to wait for DB setup before any operations.
        await this.localRagService.ensureDBInitialized();
        logger.info('LocalRagSrv instance obtained and DB initialization awaited successfully.');
      } else {
        // This case implies LocalRagSrv might not be registered in the service container.
        logger.error(
          'Failed to get LocalRagSrv instance. Ensure it is registered in the main application service container.',
        );
      }
    } catch (error) {
      logger.error(
        'Error during LocalRagSrv initialization or ensureDBInitialized call in RemoteServerSyncCtr:',
        error,
      );
      // Depending on the app's error handling strategy, this might be a critical failure.
      // For now, we log it; the localRagService will remain undefined, and local RAG calls will fail.
    }
  }

  /**
   * Helper function to perform the actual request forwarding to the remote server.
   * Accepts arguments from IPC and returns response details.
   */
  private async forwardRequest(args: {
    accessToken: string | null;
    body?: string | ArrayBuffer;
    headers: Record<string, string>;
    method: string;
    remoteServerUrl: string;
    urlPath: string; // Pass the base URL
  }): Promise<{
    // Node headers type
    body: Buffer;
    headers: Record<string, string | string[] | undefined>;
    status: number;
    statusText: string; // Return body as Buffer
  }> {
    const {
      urlPath,
      method,
      headers: originalHeaders,
      body: requestBody,
      accessToken,
      remoteServerUrl,
    } = args;

    const pathname = new URL(urlPath, remoteServerUrl).pathname; // Extract pathname from URL
    const logPrefix = `[ForwardRequest ${method} ${pathname}]`; // Add prefix for easier correlation

    if (!accessToken) {
      logger.error(`${logPrefix} No access token provided`); // Enhanced log
      return {
        body: Buffer.from(''),
        headers: {},
        status: 401,
        statusText: 'Authentication required, missing token',
      };
    }

    // 1. Determine target URL and prepare request options
    const targetUrl = new URL(urlPath, remoteServerUrl); // Combine base URL and path

    // Prepare headers, cloning and adding Authorization
    const requestHeaders: OutgoingHttpHeaders = { ...originalHeaders }; // Use OutgoingHttpHeaders
    requestHeaders['Authorization'] = `Bearer ${accessToken}`;

    // Let node handle Host, Content-Length etc. Remove potentially problematic headers
    delete requestHeaders['host'];
    delete requestHeaders['connection']; // Often causes issues
    // delete requestHeaders['content-length']; // Let node handle it based on body

    const requestOptions: https.RequestOptions | http.RequestOptions = {
      // Use union type
      headers: requestHeaders,
      hostname: targetUrl.hostname,
      method: method,
      path: targetUrl.pathname + targetUrl.search,
      port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
      protocol: targetUrl.protocol,
      // agent: false, // Consider for keep-alive issues if they arise
    };

    const requester = targetUrl.protocol === 'https:' ? https : http;

    // 2. Make the request and capture response
    return new Promise((resolve) => {
      const clientReq = requester.request(requestOptions, (clientRes: IncomingMessage) => {
        const chunks: Buffer[] = [];
        clientRes.on('data', (chunk) => {
          chunks.push(chunk);
        });

        clientRes.on('end', () => {
          const responseBody = Buffer.concat(chunks);
          resolve({
            // These are IncomingHttpHeaders
            body: responseBody,

            headers: clientRes.headers,

            status: clientRes.statusCode || 500,
            statusText: clientRes.statusMessage || 'Unknown Status',
          });
        });

        clientRes.on('error', (error) => {
          // Error during response streaming
          logger.error(
            `${logPrefix} Error reading response stream from ${targetUrl.toString()}:`,
            error,
          ); // Enhanced log
          // Rejecting might be better, but we need to resolve the outer promise for proxyTRPCRequest
          resolve({
            body: Buffer.from(`Error reading response stream: ${error.message}`),
            headers: {},

            status: 502,
            // Bad Gateway
            statusText: 'Error reading response stream',
          });
        });
      });

      clientReq.on('error', (error) => {
        logger.error(`${logPrefix} Error forwarding request to ${targetUrl.toString()}:`, error); // Enhanced log
        // Reject or resolve with error status for the outer promise
        resolve({
          body: Buffer.from(`Error forwarding request: ${error.message}`),
          headers: {},

          status: 502,
          // Bad Gateway
          statusText: 'Error forwarding request',
        });
      });

      // 3. Send request body if present
      if (requestBody) {
        if (typeof requestBody === 'string') {
          clientReq.write(requestBody, 'utf8'); // Specify encoding for strings
        } else if (requestBody instanceof ArrayBuffer) {
          clientReq.write(Buffer.from(requestBody)); // Convert ArrayBuffer to Buffer
        } else {
          // Should not happen based on type, but handle defensively
          logger.warn(`${logPrefix} Unsupported request body type received:`, typeof requestBody); // Enhanced log
        }
      }

      clientReq.end(); // Finalize the request
    });
  }

  /**
   * Handles the 'proxy-trpc-request' IPC call from the renderer process.
   * This method should be invoked by the ipcMain.handle setup in your main process entry point.
   */
  @ipcClientEvent('proxyTRPCRequest')
  public async proxyTRPCRequest(args: ProxyTRPCRequestParams): Promise<ProxyTRPCRequestResult> {
    logger.debug('Received proxyTRPCRequest IPC call:', {
      headers: args.headers,
      method: args.method,
      urlPath: args.urlPath, // Log headers too for context
    });

    const url = new URL(args.urlPath, 'http://a.b'); // Using a dummy base for URL parsing if needed
    const procedurePath = url.pathname.split('/').pop() || ''; // e.g., 'chunk.semanticSearch'
    const logPrefix = `[ProxyTRPC ${args.method} ${procedurePath}]`;

    // --- Local RAG Routing Logic ---
    // Hypothetical setting check for local RAG mode.
    // Replace with actual global store or setting manager access.
    const knowledgeBaseSettings = this.app.storeManager.get('knowledgeBaseSettings');
    const shouldUseLocalRag = knowledgeBaseSettings?.useLocalKnowledgeBase === true;

    if (shouldUseLocalRag && this.localRagService) {
      logger.info(`${logPrefix} Local RAG mode is active.`);

      // Route: chunk.semanticSearch
      if (procedurePath === 'chunk.semanticSearch' && args.method === 'POST') {
        logger.info(`${logPrefix} Routing to LocalRagSrv.semanticSearch.`);
        try {
          // Ensure body is parsed if it's a string (should be if Content-Type is application/json)
          // args.body is ArrayBuffer, so we need to decode it.
          const requestBodyString = Buffer.from(args.body).toString('utf-8');
          const requestBodyJson = JSON.parse(requestBodyString);

          // Extract parameters for semanticSearch.
          // Based on `src/app/api/rest/rag/route.ts` and `src/services/rag/chunk/index.ts`
          // the body for `chunk.semanticSearch` might look like: { json: { query: string, fileIds?: string[], limit?: number } }
          // Or it might be flatter if the tRPC client sends it directly.
          // We assume `args.body.json` is the already parsed JSON payload or needs parsing from string.
          // For this example, let's assume the structure is { query: string, limit?: number }
          // This might need adjustment based on actual client-side tRPC request structure.

          const query = requestBodyJson.query;
          const limit = requestBodyJson.limit || 10; // Default k value

          if (!query || typeof query !== 'string') {
            logger.error(`${logPrefix} Invalid 'query' parameter for local semantic search.`);
            return {
              body: Buffer.from(JSON.stringify({ error: "Invalid 'query' parameter" })).buffer,
              headers: { 'content-type': 'application/json' },
              status: 400,
              statusText: 'Bad Request',
            };
          }

          const searchResults = await this.localRagService.semanticSearch(
            query,
            limit,
            'local_rag_placeholder_key', // API key placeholder
          );

          const responseBody = JSON.stringify(searchResults);
          return {
            body: Buffer.from(responseBody).buffer,
            headers: { 'content-type': 'application/json' },
            status: 200,
            statusText: 'OK',
          };
        } catch (error) {
          logger.error(`${logPrefix} Error in LocalRagSrv.semanticSearch:`, error);
          return {
            body: Buffer.from(JSON.stringify({ error: 'Local RAG search failed' })).buffer,
            headers: { 'content-type': 'application/json' },
            status: 500,
            statusText: 'Internal Server Error',
          };
        }
      }
      // Add other local RAG routes here (e.g., for processAndStoreFile, deleteDocument)
      // For example:
      // if (procedurePath === 'document.addLocalFileToRag' && args.method === 'POST') {
      //   // ... extract filePath, documentId from args.body.json
      //   // await this.localRagService.processAndStoreFile(filePath, documentId, 'local_rag_placeholder_key');
      //   // return { status: 200, ... }
      // }
      // if (procedurePath === 'document.deleteLocalDocument' && args.method === 'POST') {
      //   // ... extract documentId from args.body.json
      //   // await this.localRagService.deleteDocument(documentId);
      //   // return { status: 200, ... }
      // }

      logger.info(`${logPrefix} Path ${procedurePath} not handled by local RAG, attempting remote forward.`);
    }
    // --- End of Local RAG Routing ---


    // --- Existing Remote Forwarding Logic ---
    logger.debug(`${logPrefix} Proceeding with remote server request for ${url.pathname}.`);
    try {
      const config = await this.remoteServerConfigCtr.getRemoteServerConfig();
      if (!config.active || (config.storageMode === 'selfHost' && !config.remoteServerUrl)) {
        logger.warn(
          `${logPrefix} Remote server sync not active or configured. Rejecting proxy request.`,
        );
        return {
          body: Buffer.from('Remote server sync not active or configured').buffer,
          headers: {},
          status: 503,
          statusText: 'Remote server sync not active or configured',
        };
      }
      const remoteServerUrl = await this.remoteServerConfigCtr.getRemoteServerUrl();

      let token = await this.remoteServerConfigCtr.getAccessToken();
      logger.debug(`${logPrefix} Remote: Initial token check: ${token ? 'Token exists' : 'No token found'}`);

      logger.info(`${logPrefix} Remote: Attempting to forward request...`);
      let response = await this.forwardRequest({ ...args, accessToken: token, remoteServerUrl });

      if (response.status === 401) {
        logger.info(`${logPrefix} Remote: Received 401. Attempting token refresh.`);
        const refreshed = await this.refreshTokenIfNeeded(logPrefix);

        if (refreshed) {
          const newToken = await this.remoteServerConfigCtr.getAccessToken();
          if (newToken) {
            logger.info(`${logPrefix} Remote: Token refreshed, retrying request.`);
            response = await this.forwardRequest({ ...args, accessToken: newToken, remoteServerUrl });
          } else {
            logger.error(`${logPrefix} Remote: Token refresh reported success, but no new token found.`);
          }
        } else {
          logger.error(`${logPrefix} Remote: Token refresh failed.`);
        }
      }

      const responseHeaders: Record<string, string> = {};
      for (const [key, value] of Object.entries(response.headers)) {
        if (value !== undefined) {
          responseHeaders[key.toLowerCase()] = Array.isArray(value) ? value.join(', ') : value;
        }
      }

      const responseBodyBuffer = response.body;
      const finalBody = responseBodyBuffer.buffer.slice(
        responseBodyBuffer.byteOffset,
        responseBodyBuffer.byteOffset + responseBodyBuffer.byteLength,
      );

      logger.debug(`${logPrefix} Remote: Forwarding successful. Status: ${response.status}`);
      return {
        body: finalBody as ArrayBuffer,
        headers: responseHeaders,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      logger.error(`${logPrefix} Error processing proxyTRPCRequest (remote path):`, error);
      return {
        body: Buffer.from(
          `Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ).buffer,
        headers: {},
        status: 500,
        statusText: 'Internal Server Error during proxy',
      };
    }
  }

  /**
   * Attempts to refresh the access token by calling the RemoteServerConfigCtr.
   * @returns Whether token refresh was successful
   */
  private async refreshTokenIfNeeded(callerLogPrefix: string = '[RefreshToken]'): Promise<boolean> {
    // Added prefix parameter
    const logPrefix = `${callerLogPrefix} [RefreshTrigger]`; // Updated prefix
    logger.debug(`${logPrefix} Entered refreshTokenIfNeeded.`);

    try {
      logger.info(`${logPrefix} Triggering refreshAccessToken in RemoteServerConfigCtr.`);
      const result = await this.remoteServerConfigCtr.refreshAccessToken();

      if (result.success) {
        logger.info(`${logPrefix} refreshAccessToken call completed successfully.`);
        return true;
      } else {
        logger.error(`${logPrefix} refreshAccessToken call failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      logger.error(`${logPrefix} Exception occurred while calling refreshAccessToken:`, error);
      return false;
    }
  }

  /**
   * Clean up resources - No protocol handler to unregister anymore
   */
  async destroy() { // Changed to async
    logger.info('Destroying RemoteServerSyncCtr');
    if (this.localRagService) {
      try {
        await this.localRagService.destroy();
        logger.info('LocalRagSrv destroyed successfully.');
      } catch (error) {
        logger.error('Error destroying LocalRagSrv:', error);
      }
    }
  }
}
