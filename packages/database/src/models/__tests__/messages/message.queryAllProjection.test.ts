// @vitest-environment node
import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../../core/getTestDB';
import { messagePlugins, messages, users } from '../../../schemas';
import type { LobeChatDatabase } from '../../../type';
import { MessageModel } from '../../message';

const serverDB: LobeChatDatabase = await getTestDB();

const userId = 'query-all-projection-user';
const otherUserId = 'query-all-projection-other';
const messageModel = new MessageModel(serverDB, userId);

beforeEach(async () => {
  await serverDB.delete(users).where(eq(users.id, userId));
  await serverDB.delete(users).where(eq(users.id, otherUserId));
  await serverDB.insert(users).values([{ id: userId }, { id: otherUserId }]);
});

afterEach(async () => {
  await serverDB.delete(users).where(eq(users.id, userId));
  await serverDB.delete(users).where(eq(users.id, otherUserId));
});

// Focused regression suite for the `queryAll` tool-call projection (full
// creator-facing dump feeding `lh message list --json` and the wiki-ingest
// image-evidence verification). Kept out of the oversized
// `message.query.test.ts` suite per AGENTS.md: files over 1200 lines must
// not grow.
describe('MessageModel queryAll — tool-call plugin projection', () => {
  it('projects tool-call plugin fields for tool messages', async () => {
    // Regression: tool-call metadata lives on the 1:1 message_plugins row;
    // without the join, `tool_call_id` / `plugin` / `pluginState` were always
    // absent and wiki-ingest image evidence could never match an
    // analyzeMedia result to its originating call.
    await serverDB.insert(messages).values([
      {
        id: 'q-plugin-tool',
        userId,
        role: 'tool',
        content: 'IMAGE_READ_OK 1:abc\nanalysis text',
      },
      { id: 'q-plugin-user', userId, role: 'user', content: 'plain question' },
    ]);
    await serverDB.insert(messagePlugins).values({
      id: 'q-plugin-tool',
      apiName: 'analyzeMedia',
      arguments: JSON.stringify({ question: 'describe', urls: ['https://r2.example/a.png'] }),
      identifier: 'lobe-agent',
      state: { model: 'gemini-vision', success: true },
      toolCallId: 'call_123',
      type: 'default',
      userId,
    });

    const result = await messageModel.queryAll();
    const toolRow = result.find((m) => m.id === 'q-plugin-tool') as any;
    const userRow = result.find((m) => m.id === 'q-plugin-user') as any;

    expect(toolRow.tool_call_id).toBe('call_123');
    expect(toolRow.plugin.identifier).toBe('lobe-agent');
    expect(toolRow.plugin.apiName).toBe('analyzeMedia');
    expect(JSON.parse(toolRow.plugin.arguments).urls).toEqual(['https://r2.example/a.png']);
    expect(toolRow.pluginState.model).toBe('gemini-vision');
    expect(toolRow.pluginState.success).toBe(true);
    // Non-tool rows have no plugin row: drizzle nullifies the whole nested
    // object when every joined column is null (see queryByIds sender note).
    expect(userRow.tool_call_id).toBeNull();
    expect(userRow.plugin).toBeNull();
  });

  it('isolates plugin fields by ownership', async () => {
    await serverDB.insert(messages).values({
      id: 'q-other-tool',
      userId: otherUserId,
      role: 'tool',
      content: 'foreign tool output',
    });
    await serverDB.insert(messagePlugins).values({
      id: 'q-other-tool',
      apiName: 'analyzeMedia',
      identifier: 'lobe-agent',
      state: { model: 'gemini-vision' },
      toolCallId: 'call_other',
      userId: otherUserId,
    });

    const result = await messageModel.queryAll();

    expect(result).toHaveLength(0);
  });

  it('redacts inline base64 data URLs from exported plugin arguments', async () => {
    // `lh message list --json` prints rows verbatim; inline media payloads
    // reach several MB per URL, so the projection must keep the attribution
    // (mime header) without dumping the base64 body.
    const bigBody = 'A'.repeat(200_000);
    await serverDB.insert(messages).values({
      id: 'q-redact-tool',
      userId,
      role: 'tool',
      content: 'vision result',
    });
    await serverDB.insert(messagePlugins).values({
      id: 'q-redact-tool',
      apiName: 'analyzeMedia',
      arguments: JSON.stringify({
        question: 'describe',
        urls: [`data:image/png;base64,${bigBody}`],
      }),
      identifier: 'lobe-agent',
      toolCallId: 'call_redact',
      userId,
    });

    const result = await messageModel.queryAll();
    const row = result.find((m) => m.id === 'q-redact-tool') as any;
    const args = JSON.parse(row.plugin.arguments);

    expect(args.urls[0]).toBe('data:image/png;base64,...redacted...');
    expect(row.plugin.arguments.length).toBeLessThan(500);
    expect(row.tool_call_id).toBe('call_redact');
  });

  it('redacts inline base64 data URLs nested inside pluginState', async () => {
    // Same export path as the arguments redaction: browser-tool screenshots
    // persist as `state.dataUrl` (packages/builtin-tool-browser client
    // executor) and reach this projection unchanged, so a multi-MB base64
    // body would again serialize verbatim into `lh message list --json`.
    const bigBody = 'B'.repeat(200_000);
    await serverDB.insert(messages).values({
      id: 'q-redact-state',
      userId,
      role: 'tool',
      content: 'screenshot captured',
    });
    await serverDB.insert(messagePlugins).values({
      id: 'q-redact-state',
      apiName: 'screenshot',
      arguments: JSON.stringify({ fullPage: false }),
      identifier: 'lobe-browser',
      state: {
        dataUrl: `data:image/jpeg;base64,${bigBody}`,
        size: { width: 1280, height: 720 },
        success: true,
      },
      toolCallId: 'call_redact_state',
      userId,
    });

    const result = await messageModel.queryAll();
    const row = result.find((m) => m.id === 'q-redact-state') as any;
    const state = row.pluginState as {
      dataUrl: string;
      size: { width: number; height: number };
      success: boolean;
    };

    // The data-URL body is redacted while the surrounding state survives:
    expect(state.dataUrl).toBe('data:image/jpeg;base64,...redacted...');
    expect(state.size).toEqual({ width: 1280, height: 720 });
    expect(state.success).toBe(true);
    expect(row.tool_call_id).toBe('call_redact_state');
  });
});
