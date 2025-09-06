import { NextRequest, NextResponse } from 'next/server';
import debug from 'debug';
import { serverDBEnv } from '@/config/db';
import { UsageRecordService } from '@/server/services/usage';
import { serverDB } from '@/database/server';

const log = debug('lobe-usage:webapi:usage:route');

/**
 * @description Process the db query for the NextAuth adapter.
 * Returns the db query result directly and let NextAuth handle the raw results.
 * @returns {
 *  success: boolean; // Only return false if the database query fails or the action is invalid.
 *  data?: any; 
 *  error?: string;
 * }
 */
export async function POST(req: NextRequest) {
    try {
        // try validate the request
        if (!req.headers.get('Authorization') || req.headers.get('Authorization')?.trim() !== `Bearer ${serverDBEnv.KEY_VAULTS_SECRET}`) {
            log('Unauthorized request, missing or invalid Authorization header');
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Parse the request body
        const ev = await req.json();
        log('Received request event:', ev);

        const usageService = new UsageRecordService(serverDB);

        let result = {};
        // Process the request based on the action
        switch (ev.action) {
            case 'createUsageRecord':
                result = await usageService.create(ev.data);
                break;
            default:
                log('Invalid action:', ev.action);
                return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
        }
        log('Processed request successfully:', result);
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        log('Error processing request:', error);
        return NextResponse.json({ success: false, error }, { status: 400 });
    }
}

export const runtime = 'nodejs';
