import { NextRequest, NextResponse } from 'next/server';
import debug from 'debug';
import { NextAuthUserService } from '@/server/services/nextAuthUser';
import { serverDBEnv } from '@/config/db';

const log = debug('lobe-next-auth:api:auth:adapter');

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
        const data = await req.json();
        log('Received request data:', data);
        const service = new NextAuthUserService();
        let result;
        switch (data.action) {
            case 'createAuthenticator':
                result = await service.createAuthenticator(data.data);
                break;
            case 'createSession':
                result = await service.createSession(data.data);
                break;
            case 'createUser':
                result = await service.createUser(data.data);
                break;
            case 'createVerificationToken':
                result = await service.createVerificationToken(data.data);
                break;
            case 'deleteSession':
                result = await service.deleteSession(data.data);
                break;
            case 'deleteUser':
                result = await service.deleteUser(data.data);
                break;
            case 'getAccount':
                result = await service.getAccount(data.data.providerAccountId, data.data.provider);
                break;
            case 'getAuthenticator':
                result = await service.getAuthenticator(data.data);
                break;
            case 'getSessionAndUser':
                result = await service.getSessionAndUser(data.data);
                break;
            case 'getUser':
                result = await service.getUser(data.data);
                break;
            case 'getUserByAccount':
                result = await service.getUserByAccount(data.data);
                break;
            case 'getUserByEmail':
                result = await service.getUserByEmail(data.data);
                break;
            case 'linkAccount':
                result = await service.linkAccount(data.data);
                break;
            case 'listAuthenticatorsByUserId':
                result = await service.listAuthenticatorsByUserId(data.data);
                break;
            case 'unlinkAccount':
                result = await service.unlinkAccount(data.data);
                break;
            case 'updateAuthenticatorCounter':
                result = await service.updateAuthenticatorCounter(data.data.credentialID, data.data.counter);
                break;
            case 'updateSession':
                result = await service.updateSession(data.data);
                break;
            case 'updateUser':
                result = await service.updateUser(data.data);
                break;
            case 'useVerificationToken':
                result = await service.useVerificationToken(data.data);
                break;
            default:
                return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        return NextResponse.json({ success: false, error }, { status: 400 });
    }
}

export const runtime = 'nodejs';