import { after } from 'next/server'
import debug from 'debug';
import urlJoin from 'url-join';

import { ChatStreamCallbacks, ChatStreamPayload } from '@/libs/model-runtime';
import { appEnv } from '@/config/app';
import { serverDBEnv } from '@/config/db';

const log = debug('lobe-usage:tracker');

export const createUsageTracker = (
    payload: ChatStreamPayload,
    metadata: {
        userId: string,
        provider: string,
        ip?: string,
    }
) => {
    const { messages, model, tools, ...parameters } = payload;
    const baseUrl = appEnv.APP_URL;

    // Ensure the baseUrl is set, otherwise throw an error
    if (!baseUrl) {
        throw new Error('LobeNextAuthDbAdapter: APP_URL is not set in environment variables');
    }
    const interactionUrl = urlJoin(baseUrl, '/webapi/usage')
    log(`createUsageTracker initialized with url: ${interactionUrl}`);

    // Ensure serverDBEnv.KEY_VAULTS_SECRET is set, otherwise throw an error
    if (!serverDBEnv.KEY_VAULTS_SECRET) {
        throw new Error('LobeNextAuthDbAdapter: KEY_VAULTS_SECRET is not set in environment variables');
    }
    const fetcher = (action: string, data: any) => fetch(interactionUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serverDBEnv.KEY_VAULTS_SECRET}`,
        },
        body: JSON.stringify({ data, action }),
    });
    return {
        callback: {
            onFinal(data) {
                after(async () => {
                    try {
                        log('Tracking usage:', data);
                        await fetcher('createSpendLog', {
                            userId: metadata.userId,
                            model,
                            provider: metadata.provider,
                            ipAddress: metadata?.ip,
                            tools,
                            usage: data?.usage,
                            speed: data?.speed,
                        })
                    } catch (error) {
                        console.error('Tracking usage error:', error);
                    }
                })
            },
        } as ChatStreamCallbacks,
    }
}