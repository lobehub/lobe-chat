import { NextResponse } from 'next/server';

import { createCallerFactory } from '@/libs/trpc/lambda';
import { lambdaRouter } from '@/server/routers/lambda';

export const runtime = 'nodejs';
export const maxDuration = 300;

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    const { model, params, options } = body;

    // Create tRPC caller for server-side execution
    const createCaller = createCallerFactory(lambdaRouter);
    const caller = createCaller({});

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
};
