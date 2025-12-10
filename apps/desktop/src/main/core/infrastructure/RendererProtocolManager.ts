import { app, protocol } from 'electron';
import { pathExistsSync } from 'fs-extra';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';

import { createLogger } from '@/utils/logger';

type ResolveRendererFilePath = (url: URL) => Promise<string | null>;
type GetExportMimeType = (filePath: string) => string | undefined;

export const DEFAULT_RENDERER_PROTOCOL_SCHEME = 'app';
export const DEFAULT_RENDERER_PROTOCOL_HOST = 'next';

const RENDERER_PROTOCOL_PRIVILEGES = {
  allowServiceWorkers: true,
  corsEnabled: true,
  secure: true,
  standard: true,
  supportFetchAPI: true,
} as const;

interface RendererProtocolManagerOptions {
  getExportMimeType: GetExportMimeType;
  host?: string;
  nextExportDir: string;
  resolveRendererFilePath: ResolveRendererFilePath;
  scheme?: string;
}

export class RendererProtocolManager {
  private readonly scheme: string;
  private readonly host: string;
  private readonly nextExportDir: string;
  private readonly resolveRendererFilePath: ResolveRendererFilePath;
  private readonly getExportMimeType: GetExportMimeType;
  private handlerRegistered = false;

  constructor(options: RendererProtocolManagerOptions) {
    const {
      scheme = DEFAULT_RENDERER_PROTOCOL_SCHEME,
      host = DEFAULT_RENDERER_PROTOCOL_HOST,
      nextExportDir,
      resolveRendererFilePath,
      getExportMimeType,
    } = options;

    this.scheme = scheme;
    this.host = host;
    this.nextExportDir = nextExportDir;
    this.resolveRendererFilePath = resolveRendererFilePath;
    this.getExportMimeType = getExportMimeType;
  }

  /**
   * Get the full renderer URL with scheme and host
   */
  getRendererUrl(): string {
    return `${this.scheme}://${this.host}`;
  }

  registerScheme() {
    protocol.registerSchemesAsPrivileged([
      {
        privileges: RENDERER_PROTOCOL_PRIVILEGES,
        scheme: this.scheme,
      },
    ]);
  }

  registerHandler() {
    if (this.handlerRegistered) return;

    if (!pathExistsSync(this.nextExportDir)) {
      createLogger('core:RendererProtocolManager').warn(
        `Next export directory not found, skip static handler: ${this.nextExportDir}`,
      );
      return;
    }

    const logger = createLogger('core:RendererProtocolManager');
    logger.debug(
      `Registering renderer ${this.scheme}:// handler for production export at host ${this.host}`,
    );

    const register = () => {
      if (this.handlerRegistered) return;

      protocol.handle(this.scheme, async (request) => {
        const url = new URL(request.url);
        const hostname = url.hostname;
        const isAssetRequest = this.isAssetRequest(url.pathname);

        if (hostname !== this.host) {
          return new Response('Not Found', { status: 404 });
        }

        let filePath = await this.resolveRendererFilePath(url);

        if (!filePath) {
          if (isAssetRequest) {
            return new Response('File Not Found', { status: 404 });
          }

          // Fallback to entry HTML for unknown routes (SPA-like behavior)
          filePath = await this.resolveRendererFilePath(new URL(`${url.origin}/`));
          if (!filePath) {
            return new Response('Render file Not Found', { status: 404 });
          }
        }

        try {
          const buffer = await readFile(filePath);
          const headers = new Headers();
          const mimeType = this.getExportMimeType(filePath);

          if (mimeType) headers.set('Content-Type', mimeType);

          return new Response(buffer, { headers });
        } catch (error) {
          logger.error(`Failed to serve export asset ${filePath}:`, error);
          return new Response('Internal Server Error', { status: 500 });
        }
      });

      this.handlerRegistered = true;
    };

    if (app.isReady()) {
      register();
    } else {
      // protocol.handle needs the default session, which is only available after ready

      app.whenReady().then(register);
    }
  }

  private isAssetRequest(pathname: string) {
    const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const ext = extname(normalizedPathname);

    return (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/static/') ||
      pathname === '/favicon.ico' ||
      pathname === '/manifest.json' ||
      !!ext
    );
  }
}
