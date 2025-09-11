import { NextResponse } from 'next/server';

import { checkAuth } from '@/app/(backend)/middleware/auth';
import { createCallerFactory } from '@/libs/trpc/lambda';
import { lambdaRouter } from '@/server/routers/lambda';

export const runtime = 'nodejs';
export const maxDuration = 300;

export const POST = checkAuth(async (req: Request, { jwtPayload }) => {
  try {
    const body = await req.json();
    const { model, params, options } = body;

    // Create tRPC caller with authentication context
    const createCaller = createCallerFactory(lambdaRouter);
    const caller = createCaller({
      jwtPayload,
      nextAuth: null, // WebAPI routes don't have nextAuth session
    });

    // Call ComfyUI service through tRPC
    const result = await caller.comfyui.createImage({
      model,
      options,
      params,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[ComfyUI WebAPI] Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
});
