import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { users } from '@/database/schemas/user';
import { serverDB } from '@/database/server';

/**
 * Check if a user exists by email
 * @param req - POST request with { email: string }
 * @returns { exists: boolean, emailVerified?: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required', exists: false }, { status: 400 });
    }

    // Query database for user with this email
    const [user] = await serverDB
      .select({
        emailVerified: users.emailVerified,
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      emailVerified: user.emailVerified,
      exists: true,
    });
  } catch (error) {
    console.error('Error checking user existence:', error);
    return NextResponse.json({ error: 'Internal server error', exists: false }, { status: 500 });
  }
}

export const runtime = 'nodejs';
