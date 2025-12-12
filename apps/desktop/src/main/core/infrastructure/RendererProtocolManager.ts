import { app, protocol } from 'electron';
import { pathExistsSync } from 'fs-extra';
import { readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';

import { createLogger } from '@/utils/logger';

type ResolveRendererFilePath = (url: URL) => Promise<string | null>;
type GetExportMimeType = (filePath: string) => string | undefined;

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

const RENDERER_DIR = 'next';
export class RendererProtocolManager {
  private readonly scheme: string;
  private readonly host: string;
  private readonly nextExportDir: string;
  private readonly resolveRendererFilePath: ResolveRendererFilePath;
  private readonly getExportMimeType: GetExportMimeType;
  private handlerRegistered = false;

  constructor(options: RendererProtocolManagerOptions) {
    const { nextExportDir, resolveRendererFilePath, getExportMimeType } = options;

    this.scheme = 'app';
    this.host = RENDERER_DIR;
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

  get protocolScheme() {
    return {
      privileges: RENDERER_PROTOCOL_PRIVILEGES,
      scheme: this.scheme,
    };
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
        const pathname = url.pathname;
        const isAssetRequest = this.isAssetRequest(pathname);
        const isExplicit404HtmlRequest = pathname.endsWith('/404.html');

        if (hostname !== this.host) {
          return new Response('Not Found', { status: 404 });
        }

        const buildFileResponse = async (targetPath: string) => {
          const buffer = await readFile(targetPath);
          const headers = new Headers();
          const mimeType = this.getExportMimeType(targetPath);

          if (mimeType) headers.set('Content-Type', mimeType);

          return new Response(buffer, { headers });
        };

        const resolveEntryFilePath = () =>
          this.resolveRendererFilePath(new URL(`${this.scheme}://${this.host}/`));

        let filePath = await this.resolveRendererFilePath(url);

        // If the resolved file is the export 404 page, treat it as missing so we can
        // fall back to the entry HTML for SPA routing (unless explicitly requested).
        if (filePath && this.is404Html(filePath) && !isExplicit404HtmlRequest) {
          filePath = null;
        }

        if (!filePath) {
          if (isAssetRequest) {
            return new Response('File Not Found', { status: 404 });
          }

          // Fallback to entry HTML for unknown routes (SPA-like behavior)
          filePath = await resolveEntryFilePath();
          if (!filePath || this.is404Html(filePath)) {
            return new Response('Render file Not Found', { status: 404 });
          }
        }

        try {
          return await buildFileResponse(filePath);
        } catch (error) {
          const code = (error as NodeJS.ErrnoException).code;

          if (code === 'ENOENT') {
            logger.warn(`Export asset missing on disk ${filePath}, falling back`, error);

            if (isAssetRequest) {
              return new Response('File Not Found', { status: 404 });
            }

            const fallbackPath = await resolveEntryFilePath();
            if (!fallbackPath || this.is404Html(fallbackPath)) {
              return new Response('Render file Not Found', { status: 404 });
            }

            try {
              return await buildFileResponse(fallbackPath);
            } catch (fallbackError) {
              logger.error(`Failed to serve fallback entry ${fallbackPath}:`, fallbackError);
              return new Response('Internal Server Error', { status: 500 });
            }
          }

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

  private is404Html(filePath: string) {
    return basename(filePath) === '404.html';
  }
}
