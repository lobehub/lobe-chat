import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LarkApiClient } from './api';

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });

const tokenResponse = () =>
  jsonResponse({ code: 0, expire: 7200, msg: 'ok', tenant_access_token: 't-abc' });

describe('LarkApiClient cloud documents', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('getDocxRawContent hits the raw_content endpoint with the tenant token', async () => {
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(jsonResponse({ code: 0, data: { content: '标题\n正文' }, msg: 'ok' }));

    const api = new LarkApiClient('cli_app', 'secret', 'feishu');
    await expect(api.getDocxRawContent('doxcnABC')).resolves.toBe('标题\n正文');

    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe('https://open.feishu.cn/open-apis/docx/v1/documents/doxcnABC/raw_content');
    expect(init.method).toBe('GET');
    expect(init.headers.Authorization).toBe('Bearer t-abc');
  });

  it('getDocxDocument returns title and revision', async () => {
    fetchMock.mockResolvedValueOnce(tokenResponse()).mockResolvedValueOnce(
      jsonResponse({
        code: 0,
        data: { document: { document_id: 'doxcnABC', revision_id: 12, title: '评审会纪要' } },
        msg: 'ok',
      }),
    );

    const api = new LarkApiClient('cli_app', 'secret', 'lark');
    await expect(api.getDocxDocument('doxcnABC')).resolves.toEqual({
      documentId: 'doxcnABC',
      revisionId: 12,
      title: '评审会纪要',
    });
    expect(fetchMock.mock.calls[1][0]).toBe(
      'https://open.larksuite.com/open-apis/docx/v1/documents/doxcnABC',
    );
  });

  it('getWikiNode resolves the wrapped object token', async () => {
    fetchMock.mockResolvedValueOnce(tokenResponse()).mockResolvedValueOnce(
      jsonResponse({
        code: 0,
        data: {
          node: { node_token: 'wikcnX', obj_token: 'doxcnY', obj_type: 'docx', title: 'Wiki 页' },
        },
        msg: 'ok',
      }),
    );

    const api = new LarkApiClient('cli_app', 'secret', 'feishu');
    await expect(api.getWikiNode('wikcnX')).resolves.toEqual({
      nodeToken: 'wikcnX',
      objToken: 'doxcnY',
      objType: 'docx',
      title: 'Wiki 页',
    });
    expect(fetchMock.mock.calls[1][0]).toBe(
      'https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node?token=wikcnX',
    );
  });

  it('honours LARK_API_BASE_URL for every call, auth included', async () => {
    vi.stubEnv('LARK_API_BASE_URL', 'http://127.0.0.1:4190/open-apis/');
    fetchMock
      .mockResolvedValueOnce(tokenResponse())
      .mockResolvedValueOnce(jsonResponse({ code: 0, data: { content: 'x' }, msg: 'ok' }));

    const api = new LarkApiClient('cli_app', 'secret', 'feishu');
    await api.getDocxRawContent('doxcnABC');

    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://127.0.0.1:4190/open-apis/auth/v3/tenant_access_token/internal',
    );
    expect(fetchMock.mock.calls[1][0]).toBe(
      'http://127.0.0.1:4190/open-apis/docx/v1/documents/doxcnABC/raw_content',
    );
  });

  it('surfaces the Feishu error code and permission violation on failure', async () => {
    fetchMock.mockResolvedValueOnce(tokenResponse()).mockResolvedValueOnce(
      jsonResponse({
        code: 1770032,
        error: {
          permission_violations: [
            { description: '查看新版文档', subject: 'docx:document:readonly', type: 'scope' },
          ],
        },
        msg: 'forbidden',
      }),
    );

    const api = new LarkApiClient('cli_app', 'secret', 'feishu');
    await expect(api.getDocxRawContent('doxcnABC')).rejects.toThrow(
      /1770032 forbidden \(missing permission — docx:document:readonly: 查看新版文档\)/,
    );
  });
});
