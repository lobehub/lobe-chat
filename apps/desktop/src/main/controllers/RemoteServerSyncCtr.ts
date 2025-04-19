import { session as electronSession } from 'electron';
import http, { IncomingMessage } from 'node:http';
import https from 'node:https';
import { Socket } from 'node:net';
import { pipeline } from 'node:stream/promises';
import { URL } from 'node:url';

import { createLogger } from '@/utils/logger';
import {
  CustomRequestHandler,
  ReadableServerResponse,
  createRequest as createNodeRequestFromElectronRequest,
} from '@/utils/next-electron-rsc';

import RemoteServerConfigCtr from './RemoteServerConfigCtr';
import { ControllerModule } from './index';

const trpcProxyPath = ['/trpc/lambda', '/trpc/tools', '/trpc/async'];

// Create logger
const logger = createLogger('controllers:RemoteServerSyncCtr');

// --- Helper function to create a dummy socket ---
// createRequest requires a socket, even if we don't directly use its connection features here.
const createDummySocket = (): Socket => {
  const socket = new Socket();
  // Prevent potential errors if methods are called unexpectedly
  // @ts-ignore
  socket.end = () => {};
  // @ts-ignore
  socket.destroy = () => {};
  socket.write = () => true;
  return socket;
};

/**
 * Remote Server Sync Controller
 * For handling data synchronization with remote servers, including intercepting and processing tRPC requests
 */
export default class RemoteServerSyncCtr extends ControllerModule {
  /**
   * Remote server configuration controller
   */
  private get remoteServerConfigCtr() {
    return this.app.getController(RemoteServerConfigCtr);
  }

  /**
   * Request interceptor unregister function
   */
  private unregisterRequestHandler?: () => void;

  /**
   * Controller initialization
   */
  afterAppReady() {
    logger.info('Initializing remote server sync controller');
    this.registerApiRequestHandler();
  }

  /**
   * Register tRPC request handler using utilities from next-electron-rsc
   */
  registerApiRequestHandler() {
    // If already registered, unregister the old handler first
    if (this.unregisterRequestHandler) {
      this.unregisterRequestHandler();
      this.unregisterRequestHandler = undefined;
    }

    logger.info('Registering tRPC request handler using next-electron-rsc utils');

    // Create request handler
    const handler: CustomRequestHandler = async (originalElectronRequest) => {
      try {
        // Check if it's a tRPC request
        const isApiRequest = trpcProxyPath.some((path) =>
          originalElectronRequest.url.includes(path),
        );
        if (!isApiRequest) return null; // Not an Api request

        // Get remote server configuration
        const config = await this.remoteServerConfigCtr.getRemoteServerConfig();
        if (!config.active || !config.remoteServerUrl) return null;

        // --- Helper function to perform the actual request forwarding ---
        const forwardRequest = async (
          electronRequest: Request,
          accessToken: string | null,
        ): Promise<Response> => {
          if (!accessToken) {
            logger.error('No access token provided for forwarding');
            // Indicate authentication required, similar to how we handle refresh failure later
            return new Response('Authentication required, missing token', { status: 401 });
          }

          // 1. Create Node.js compatible request and response objects
          const dummySocket = createDummySocket();
          // We need the session to potentially read cookies if createNodeRequestFromElectronRequest uses it
          const session = electronSession.defaultSession;
          const nodeReq: IncomingMessage = await createNodeRequestFromElectronRequest({
            request: electronRequest,
            session,
            socket: dummySocket,
          });
          const nodeRes = new ReadableServerResponse(nodeReq); // Use the class from next-electron-rsc

          // 2. Determine target URL and prepare request options for node:http/https
          const originalUrl = new URL(electronRequest.url); // Use the original electron request URL
          const targetUrl = new URL(
            originalUrl.pathname + originalUrl.search,
            config.remoteServerUrl,
          );

          logger.debug(
            `Forwarding tRPC request: ${electronRequest.url} -> ${targetUrl.toString()}`,
          );

          const requestOptions: http.RequestOptions = {
            headers: { ...nodeReq.headers }, // Use headers parsed by createRequest
            hostname: targetUrl.hostname,
            method: nodeReq.method,
            path: targetUrl.pathname + targetUrl.search,
            port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
            protocol: targetUrl.protocol,
          };
          // Add/Override Authorization header
          requestOptions.headers['Authorization'] = `Bearer ${accessToken}`;
          // Let node handle Host, Content-Length etc. Remove if present from createRequest
          delete requestOptions.headers['host'];
          // delete requestOptions.headers['content-length']; // Node calculates this

          const requester = targetUrl.protocol === 'https:' ? https : http;

          // 3. Make the request and pipe response back via ReadableServerResponse
          return new Promise<Response>((resolve, reject) => {
            const clientReq = requester.request(requestOptions, (clientRes) => {
              // Handle 401 specifically before piping
              if (clientRes.statusCode === 401) {
                logger.warn('Received 401 response from forwarded request');
                resolve(
                  new Response(null, {
                    // eslint-disable-next-line no-undef
                    headers: clientRes.headers as HeadersInit,
                    status: 401,
                    statusText: clientRes.statusMessage,
                  }),
                );
                clientRes.resume(); // Consume data
                return;
              }

              // Set status and headers on our ReadableServerResponse
              nodeRes.writeHead(
                clientRes.statusCode || 200,
                clientRes.statusMessage || 'OK',
                clientRes.headers,
              );

              // Resolve the main promise *immediately* with the Response object from nodeRes.
              // This Response contains the headers and the ReadableStream for the body.
              resolve(nodeRes.getResponse());

              // Start the pipeline to pipe the actual body data into the Response's stream.
              // Run this in the background; its completion doesn't affect the resolved promise.
              pipeline(clientRes, nodeRes)
                .then(() => {
                  logger.debug(`Response pipeline finished for ${targetUrl.toString()}`);
                })
                .catch((pipeError) => {
                  // Error occurred *during* body streaming, after headers were sent.
                  logger.error('Error piping response body:', pipeError);
                  // The Response object is already returned. Attempt to signal error on the stream.
                  nodeRes.destroy(pipeError); // Destroy the ServerResponse, which should signal the stream consumer
                });
            });

            clientReq.on('error', (error) => {
              logger.error('Error forwarding request:', error);
              reject(new Response(`Error forwarding request: ${error.message}`, { status: 502 }));
            });

            // Pipe the request body (from the IncomingMessage generated by createRequest)
            // Note: createRequest already pushes the body data into the IncomingMessage stream
            pipeline(nodeReq, clientReq).catch((pipeError) => {
              logger.error('Error piping request body to target:', pipeError);
              clientReq.destroy(pipeError);
              reject(new Response('Error processing request body', { status: 500 }));
            });
          });
        };
        // --- End of helper function ---

        // Get initial token
        let token = await this.remoteServerConfigCtr.getAccessToken();
        let response: Response | null = null;

        // Try initial request
        if (token) {
          response = await forwardRequest(originalElectronRequest, token);
        } else {
          logger.warn('No initial access token found');
          // Simulate a 401 to trigger refresh logic centrally
          response = new Response('Authentication required, missing initial token', {
            status: 401,
          });
        }

        // Handle 401: Refresh token and retry if necessary
        if (response.status === 401) {
          logger.info('Attempting token refresh due to missing token or 401 response');
          const refreshed = await this.refreshTokenIfNeeded();

          if (refreshed) {
            const newToken = await this.remoteServerConfigCtr.getAccessToken();
            if (newToken) {
              logger.info('Token refreshed successfully, retrying request');
              // IMPORTANT: Retry with the *original* Electron request object
              response = await forwardRequest(originalElectronRequest, newToken);
            } else {
              logger.error('Token refresh reported success, but failed to retrieve new token');
              // Return the 401 response we generated or received
            }
          } else {
            logger.error('Token refresh failed');
            // Return the 401 response
          }
        }

        // Return the final response
        return response;
      } catch (error) {
        logger.error('Unhandled error processing tRPC request:', error);
        if (error instanceof Response) {
          return error; // Return the Response object created in case of error
        }
        // Ensure a Response object is always returned
        return new Response(`Internal Server Error: ${error.message || 'Unknown error'}`, {
          status: 500,
        });
      }
    };

    // Register request handler
    this.unregisterRequestHandler = this.app.registerRequestHandler(handler);
  }

  /**
   * Refresh token if needed (same as previous version)
   * @returns Whether token refresh was successful
   */
  private async refreshTokenIfNeeded(): Promise<boolean> {
    // Debounce refresh logic
    if (this.remoteServerConfigCtr.isTokenRefreshing()) {
      logger.debug('Token refresh already in progress, waiting briefly...');
      await new Promise((resolve) => {
        setTimeout(resolve, 1500);
      });
      return !!(await this.remoteServerConfigCtr.getAccessToken());
    }

    this.remoteServerConfigCtr.setTokenRefreshing(true);

    try {
      const config = await this.remoteServerConfigCtr.getRemoteServerConfig();
      if (!config.active) {
        logger.debug('Remote server not active, skipping token refresh');
        return false;
      }

      logger.info('Attempting to refresh access token');
      const result = await this.remoteServerConfigCtr.refreshAccessToken();

      if (result.success) {
        logger.info('Token refresh successful');
        return true;
      } else {
        logger.error(`Token refresh failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      logger.error('Exception during token refresh:', error);
      return false;
    } finally {
      this.remoteServerConfigCtr.setTokenRefreshing(false);
    }
  }
}
