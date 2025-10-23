import debug from 'debug';
import { NextRequest, NextResponse } from 'next/server';

import { getServerDB } from '@/database/core/db-adaptor';
import { AgentRuntimeService } from '@/server/services/agentRuntime';

import { isEnableAgent } from '../isEnableAgent';

const log = debug('api-route:agent:execute-step');

export async function POST(request: NextRequest) {
  if (!isEnableAgent()) {
    return NextResponse.json({ error: 'Agent features are not enabled' }, { status: 404 });
  }

  // Initialize service
  const serverDB = await getServerDB();
  // TODO: remove userId
  const agentRuntimeService = new AgentRuntimeService(serverDB, 'github|28616219');

  const startTime = Date.now();

  const body = await request.json();
  try {
    const {
      sessionId,
      stepIndex = 0,
      context,
      humanInput,
      approvedToolCall,
      rejectionReason,
    } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    log(`[${sessionId}] Starting step ${stepIndex}`);

    // 使用 AgentRuntimeService 执行步骤
    const result = await agentRuntimeService.executeStep({
      approvedToolCall,
      context,
      humanInput,
      rejectionReason,
      sessionId,
      stepIndex,
    });

    const executionTime = Date.now() - startTime;

    const responseData = {
      completed: result.state.status === 'done',
      error: result.state.status === 'error' ? result.state.error : undefined,
      executionTime,
      nextStepIndex: result.nextStepScheduled ? stepIndex + 1 : undefined,
      nextStepScheduled: result.nextStepScheduled,
      pendingApproval: result.state.pendingToolsCalling,
      pendingPrompt: result.state.pendingHumanPrompt,
      pendingSelect: result.state.pendingHumanSelect,
      sessionId,
      status: result.state.status,
      stepIndex,
      success: result.success,
      totalCost: result.state.cost?.total || 0,
      totalSteps: result.state.stepCount,
      waitingForHuman: result.state.status === 'waiting_for_human',
    };

    log(
      `[${sessionId}] Step ${stepIndex} completed (${executionTime}ms, status: ${result.state.status})`,
    );

    return NextResponse.json(responseData);
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error('Error in execution: %O', error);

    return NextResponse.json(
      {
        error: error.message,
        executionTime,
        sessionId: body?.sessionId,
        stepIndex: body?.stepIndex || 0,
      },
      { status: 500 },
    );
  }
}

/**
 * 健康检查端点
 */
export async function GET() {
  if (!isEnableAgent()) {
    return NextResponse.json({ error: 'Agent features are not enabled' }, { status: 404 });
  }

  try {
    return NextResponse.json({
      healthy: true,
      message: 'Agent execution service is running',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        healthy: false,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
