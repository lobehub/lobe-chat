import { Langfuse } from 'langfuse';
import { CreateLangfuseTraceBody } from 'langfuse-core';

import { getServerConfig } from '@/config/server';
import { CURRENT_VERSION } from '@/const/version';

/**
 * We use langfuse as the tracing system to trace the request and response
 */
class TraceClient {
  private _client?: Langfuse;

  constructor() {
    const { ENABLE_LANGFUSE, LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_HOST } =
      getServerConfig();

    if (!ENABLE_LANGFUSE) return;

    // when enabled langfuse, make sure the key are ready in envs
    if (!LANGFUSE_PUBLIC_KEY || !LANGFUSE_SECRET_KEY) {
      console.log('-----');
      console.error(
        "You are enabling langfuse but don't set the `LANGFUSE_PUBLIC_KEY` or `LANGFUSE_SECRET_KEY`. Please check your env",
      );

      throw new TypeError('NO_LANGFUSE_KEY_ERROR');
    }

    this._client = new Langfuse({
      baseUrl: LANGFUSE_HOST,
      publicKey: LANGFUSE_PUBLIC_KEY,
      release: CURRENT_VERSION,
      secretKey: LANGFUSE_SECRET_KEY,
    });
  }

  createTrace(param: CreateLangfuseTraceBody) {
    return this._client?.trace({
      ...param,
    });
  }

  async shutdownAsync() {
    await this._client?.shutdownAsync();
  }
}

export const traceClient = new TraceClient();
