import { desensitizeUrl } from '../utils/desensitizeUrl';

class CloudflareStreamTransformer {
  private textDecoder = new TextDecoder();
  private buffer: string = '';

  private parseChunk(chunk: string, controller: TransformStreamDefaultController) {
    const dataPrefix = /^data: /;
    const json = chunk.replace(dataPrefix, '');
    const parsedChunk = JSON.parse(json);
    controller.enqueue(`event: text\n`);
    controller.enqueue(`data: ${JSON.stringify(parsedChunk.response)}\n\n`);
  }

  public async transform(chunk: Uint8Array, controller: TransformStreamDefaultController) {
    let textChunk = this.textDecoder.decode(chunk);
    if (this.buffer.trim() !== '') {
      textChunk = this.buffer + textChunk;
      this.buffer = '';
    }
    const splits = textChunk.split('\n\n');
    for (let i = 0; i < splits.length - 1; i++) {
      if (/\[DONE]/.test(splits[i].trim())) {
        return;
      }
      this.parseChunk(splits[i], controller);
    }
    const lastChunk = splits.at(-1)!;
    if (lastChunk.trim() !== '') {
      this.buffer += lastChunk; // does not need to be trimmed.
    } // else drop.
  }
}

const CF_PROPERTY_NAME = 'property_id';
const DEFAULT_BASE_URL_PREFIX = 'https://api.cloudflare.com';

function fillUrl(accountID: string): string {
  return `${DEFAULT_BASE_URL_PREFIX}/client/v4/accounts/${accountID}/ai/run/`;
}

function desensitizeAccountId(path: string): string {
  return path.replace(/\/[\dA-Fa-f]{32}\//, '/****/');
}

function desensitizeCloudflareUrl(url: string): string {
  const urlObj = new URL(url);
  let { protocol, hostname, port, pathname, search } = urlObj;
  if (url.startsWith(DEFAULT_BASE_URL_PREFIX)) {
    return `${protocol}//${hostname}${port ? `:${port}` : ''}${desensitizeAccountId(pathname)}${search}`;
  } else {
    const desensitizedUrl = desensitizeUrl(`${protocol}//${hostname}${port ? `:${port}` : ''}`);
    if (desensitizedUrl.endsWith('/') && pathname.startsWith('/')) {
      pathname = pathname.slice(1);
    }
    return `${desensitizedUrl}${desensitizeAccountId(pathname)}${search}`;
  }
}

function getModelBeta(model: any): boolean {
  try {
    const betaProperty = model['properties'].filter(
      (property: any) => property[CF_PROPERTY_NAME] === 'beta',
    );
    if (betaProperty.length === 1) {
      return betaProperty[0]['value'] === 'true'; // This is a string now.
    }
    return false;
  } catch {
    return false;
  }
}

function getModelDisplayName(model: any, beta: boolean): string {
  const modelId = model['name'];
  let name = modelId.split('/').at(-1)!;
  if (beta) {
    name += ' (Beta)';
  }
  return name;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
function getModelFunctionCalling(model: any): boolean {
  try {
    const fcProperty = model['properties'].filter(
      (property: any) => property[CF_PROPERTY_NAME] === 'function_calling',
    );
    if (fcProperty.length === 1) {
      return fcProperty[0]['value'] === 'true';
    }
    return false;
  } catch {
    return false;
  }
}

function getModelTokens(model: any): number | undefined {
  try {
    const tokensProperty = model['properties'].filter(
      (property: any) => property[CF_PROPERTY_NAME] === 'max_total_tokens',
    );
    if (tokensProperty.length === 1) {
      return parseInt(tokensProperty[0]['value']);
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function convertModelManifest(model: any) {
  const modelBeta = getModelBeta(model);
  return {
    description: model['description'],
    displayName: getModelDisplayName(model, modelBeta),
    enabled: !modelBeta,
    functionCall: false, //getModelFunctionCalling(model),
    id: model['name'],
    tokens: getModelTokens(model),
  };
}

export {
  CloudflareStreamTransformer,
  convertModelManifest,
  DEFAULT_BASE_URL_PREFIX,
  desensitizeCloudflareUrl,
  fillUrl,
  getModelBeta,
  getModelDisplayName,
  getModelFunctionCalling,
  getModelTokens,
};
