import { after } from 'next/server'

import { UsageModel } from '@/database/models/usage';
import { serverDB } from '@/database/core/dbForEdge';
import { ChatStreamCallbacks, ChatStreamPayload } from '@/libs/model-runtime';

export const createUsageTracker = (
    payload: ChatStreamPayload,
    userId: string,
) => {
    const { messages, model, tools, ...parameters } = payload;
    const usageModel = new UsageModel(serverDB, userId);
    return {
        callback: {
            onFinal(data) {
                after(async () => {
                    try {
                        console.log('Tracking usage:', data);
                    } catch (error) {
                        console.error('Tracking usage error:', error);
                    }
                })
            },
        } as ChatStreamCallbacks,
    }
}