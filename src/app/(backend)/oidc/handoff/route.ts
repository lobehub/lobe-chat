import debug from 'debug';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { AuthHandoffModel } from '@/database/models/authHandoff';
import { serverDB } from '@/database/server';

const log = debug('lobe-oidc:handoff');

// 请求体验证 schema
const createHandoffSchema = z.object({
  client: z.string(),
  id: z.string(),
  payload: z.record(z.unknown()),
});

/**
 * POST /oidc/handoff
 * 创建认证凭证传递记录
 */
export async function POST(request: NextRequest) {
  log('Received POST request for /oidc/handoff');

  try {
    const body = await request.json();
    const { id, client, payload } = createHandoffSchema.parse(body);

    log('Creating handoff record - id=%s, client=%s', id, client);

    const authHandoffModel = new AuthHandoffModel(serverDB);
    const result = await authHandoffModel.create({
      client,
      id,
      payload,
    });

    log('Handoff record created successfully - id=%s', result.id);

    return NextResponse.json({ data: result, success: true });
  } catch (error) {
    log('Error creating handoff record: %O', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { details: error.errors, error: 'Invalid request body' },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /oidc/handoff?id=xxx&client=xxx
 * 轮询获取并消费认证凭证
 */
export async function GET(request: NextRequest) {
  log('Received GET request for /oidc/handoff');

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const client = searchParams.get('client');

    if (!id || !client) {
      return NextResponse.json(
        { error: 'Missing required parameters: id and client' },
        { status: 400 },
      );
    }

    log('Fetching handoff record - id=%s, client=%s', id, client);

    const authHandoffModel = new AuthHandoffModel(serverDB);
    const result = await authHandoffModel.fetchAndConsume(id, client);

    if (!result) {
      log('Handoff record not found or expired - id=%s', id);
      return NextResponse.json({ error: 'Handoff record not found or expired' }, { status: 404 });
    }

    log('Handoff record found and consumed - id=%s', id);

    return NextResponse.json({ data: result, success: true });
  } catch (error) {
    log('Error fetching handoff record: %O', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /oidc/handoff/cleanup
 * 清理过期的凭证记录
 * 可以通过定时任务调用
 */
export async function DELETE() {
  log('Received DELETE request for /oidc/handoff cleanup');

  try {
    const authHandoffModel = new AuthHandoffModel(serverDB);
    const cleanedCount = await authHandoffModel.cleanupExpired();

    log('Cleaned up %d expired handoff records', cleanedCount);

    return NextResponse.json({ cleanedCount, success: true });
  } catch (error) {
    log('Error cleaning up handoff records: %O', error);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
