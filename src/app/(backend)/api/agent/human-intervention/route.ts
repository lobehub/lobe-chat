import debug from 'debug';
import { NextRequest, NextResponse } from 'next/server';

import { AgentRuntimeService } from '@/server/services/agentRuntime';

import { isEnableAgent } from '../isEnableAgent';

const log = debug('api-route:agent:human-intervention');

/**
 * 处理人工干预请求
 */
export async function POST(request: NextRequest) {
  if (!isEnableAgent()) {
    return NextResponse.json({ error: 'Agent features are not enabled' }, { status: 404 });
  }

  // Initialize service
  const agentRuntimeService = new AgentRuntimeService();

  try {
    const body = await request.json();
    const { sessionId, action, data, reason } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json(
        {
          error: 'action is required (approve, reject, input, select)',
        },
        { status: 400 },
      );
    }

    log(`Processing ${action} for session ${sessionId}`);

    // 构建干预参数
    let interventionParams: any = {
      // 会从状态管理器获取
      action,

      sessionId,
      stepIndex: 0,
    };

    switch (action) {
      case 'approve': {
        if (!data?.approvedToolCall) {
          return NextResponse.json(
            {
              error: 'approvedToolCall is required for approve action',
            },
            { status: 400 },
          );
        }
        interventionParams.approvedToolCall = data.approvedToolCall;
        break;
      }
      case 'reject': {
        interventionParams.rejectionReason = reason || 'Tool call rejected by user';
        break;
      }
      case 'input': {
        if (!data?.input) {
          return NextResponse.json(
            {
              error: 'input is required for input action',
            },
            { status: 400 },
          );
        }
        interventionParams.humanInput = { response: data.input };
        break;
      }
      case 'select': {
        if (!data?.selection) {
          return NextResponse.json(
            {
              error: 'selection is required for select action',
            },
            { status: 400 },
          );
        }
        interventionParams.humanInput = { selection: data.selection };
        break;
      }
      default: {
        return NextResponse.json(
          {
            error: `Unknown action: ${action}. Supported actions: approve, reject, input, select`,
          },
          { status: 400 },
        );
      }
    }

    // 使用 AgentRuntimeService 处理人工干预
    const result = await agentRuntimeService.processHumanIntervention(interventionParams);

    return NextResponse.json({
      action,
      message: `Human intervention processed successfully. Execution resumed.`,
      scheduledMessageId: result.messageId,
      sessionId,
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    log('Error processing intervention: %O', error);

    return NextResponse.json(
      {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * 获取待处理的人工干预列表
 */
export async function GET(request: NextRequest) {
  if (!isEnableAgent()) {
    return NextResponse.json({ error: 'Agent features are not enabled' }, { status: 404 });
  }

  // Initialize service
  const agentRuntimeService = new AgentRuntimeService();

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    if (!sessionId && !userId) {
      return NextResponse.json(
        {
          error: 'Either sessionId or userId parameter is required',
        },
        { status: 400 },
      );
    }

    log('Getting pending interventions for sessionId: %s, userId: %s', sessionId, userId);

    // 使用 AgentRuntimeService 获取待处理的人工干预列表
    const result = await agentRuntimeService.getPendingInterventions({
      sessionId: sessionId || undefined,
      userId: userId || undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    log('Error getting pending interventions: %O', error);

    return NextResponse.json(
      {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
