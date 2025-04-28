import {
  ProxyTRPCRequestParams,
  ProxyTRPCRequestResult,
} from '@lobechat/electron-client-ipc/src/types/proxyTRPCRequest';
import { Buffer } from 'node:buffer';
import http, { IncomingMessage, OutgoingHttpHeaders } from 'node:http';
import https from 'node:https';
import { URL } from 'node:url';

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
  afterAppReady() {
    logger.info('RemoteServerSyncCtr initialized (IPC based)');
    // No need to register protocol handler anymore
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

    logger.debug(`${logPrefix} Forwarding to ${targetUrl.pathname.toString()}`); // Enhanced log

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
          logger.debug(
            `${logPrefix} Received response from ${targetUrl.toString()}: ${clientRes.statusCode}`,
          ); // Enhanced log
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

    const logPrefix = `[ProxyTRPC ${args.method} ${args.urlPath}]`; // Prefix for this specific request

    try {
      const config = await this.remoteServerConfigCtr.getRemoteServerConfig();
      if (!config.active || (config.storageMode === 'selfHost' && !config.remoteServerUrl)) {
        logger.warn(
          `${logPrefix} Remote server sync not active or configured. Rejecting proxy request.`,
        ); // Enhanced log
        return {
          body: Buffer.from('Remote server sync not active or configured').buffer,
          headers: {},

          status: 503,
          // Service Unavailable
          statusText: 'Remote server sync not active or configured', // Return ArrayBuffer
        };
      }
      const remoteServerUrl = await this.remoteServerConfigCtr.getRemoteServerUrl();

      // Get initial token
      let token = await this.remoteServerConfigCtr.getAccessToken();
      logger.debug(
        `${logPrefix} Initial token check: ${token ? 'Token exists' : 'No token found'}`,
      ); // Added log

      logger.info(`${logPrefix} Attempting to forward request...`); // Added log
      let response = await this.forwardRequest({ ...args, accessToken: token, remoteServerUrl });

      // Handle 401: Refresh token and retry if necessary
      if (response.status === 401) {
        logger.info(`${logPrefix} Received 401 from forwarded request. Attempting token refresh.`); // Enhanced log
        const refreshed = await this.refreshTokenIfNeeded(logPrefix); // Pass prefix for context

        if (refreshed) {
          const newToken = await this.remoteServerConfigCtr.getAccessToken();
          if (newToken) {
            logger.info(`${logPrefix} Token refreshed successfully, retrying the request.`); // Enhanced log
            response = await this.forwardRequest({
              ...args,
              accessToken: newToken,
              remoteServerUrl,
            });
          } else {
            logger.error(
              `${logPrefix} Token refresh reported success, but failed to retrieve new token. Keeping original 401 response.`,
            ); // Enhanced log
            // Keep the original 401 response
          }
        } else {
          logger.error(`${logPrefix} Token refresh failed. Keeping original 401 response.`); // Enhanced log
          // Keep the original 401 response
        }
      }

      // Convert headers and body to format defined in IPC event
      const responseHeaders: Record<string, string> = {};
      for (const [key, value] of Object.entries(response.headers)) {
        if (value !== undefined) {
          responseHeaders[key.toLowerCase()] = Array.isArray(value) ? value.join(', ') : value;
        }
      }

      // Return the final response, ensuring body is serializable (string or ArrayBuffer)
      const responseBody = response.body; // Buffer

      // IMPORTANT: Check IPC limits. Large bodies might fail. Consider chunking if needed.
      // Convert Buffer to ArrayBuffer for IPC
      const finalBody = responseBody.buffer.slice(
        responseBody.byteOffset,
        responseBody.byteOffset + responseBody.byteLength,
      );

      logger.debug(`${logPrefix} Forwarding successful. Status: ${response.status}`); // Added log
      return {
        body: finalBody as ArrayBuffer,
        headers: responseHeaders,
        status: response.status,
        statusText: response.statusText, // Return ArrayBuffer
      };
    } catch (error) {
      logger.error(`${logPrefix} Unhandled error processing proxyTRPCRequest:`, error); // Enhanced log
      // Ensure a serializable error response is returned
      return {
        body: Buffer.from(
          `Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ).buffer,
        headers: {},
        status: 500,
        statusText: 'Internal Server Error during proxy', // Return ArrayBuffer
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
  destroy() {
    logger.info('Destroying RemoteServerSyncCtr');
    // Nothing specific to clean up here regarding request handling now
  }
}
