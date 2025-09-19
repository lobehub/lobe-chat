import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { getServerDB } from '@/database/core/db-adaptor';
import { payments } from '@/database/schemas';
import { ClerkAuth } from '@/libs/clerk-auth';
import SepayService from '@/services/sepay';

// Create Sepay payment
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    const { amount, description, buyerName, buyerEmail, buyerPhone, returnUrl, cancelUrl } = body;

    // Validate required fields
    if (!amount || !description) {
      return NextResponse.json(
        {
          error: 1,
          message: 'Amount and description are required',
        },
        { status: 400 },
      );
    }

    // Validate amount (must be positive integer for VND)
    if (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json(
        {
          error: 1,
          message: 'Amount must be a positive integer (VND)',
        },
        { status: 400 },
      );
    }

    // Initialize Sepay service
    const sepayService = new SepayService();

    // Generate unique order code
    const orderCode = sepayService.generateOrderCode();

    // Prepare payment data
    const paymentData = {
      amount,
      buyerEmail,
      buyerName,
      buyerPhone,
      cancelUrl: cancelUrl || `${request.nextUrl.origin}/payment/cancelled`,
      description: (() => {
        const { userId } = new ClerkAuth().getAuthFromRequest(request as any);
        return userId ? `[UID:${userId}] ${description}` : description;
      })(),
      orderCode,
      returnUrl: returnUrl || `${request.nextUrl.origin}/api/sepay/return`,
    };

    console.log('Creating Sepay payment:', {
      amount: sepayService.formatVNDAmount(amount),
      description,
      orderCode,
    });

    // Create payment
    const result = await sepayService.createPayment(paymentData);

    if (result.success && result.data) {
      // Persist initial payment record to PostgreSQL (status=pending)
      try {
        const db = await getServerDB();
        if (!db || typeof (db as any).insert !== 'function') {
          throw new Error(
            'Database is not initialized. Set NEXT_PUBLIC_SERVICE_MODE=server, DATABASE_DRIVER=node (local), provide DATABASE_URL and KEY_VAULTS_SECRET.',
          );
        }
        await (db as any).insert(payments).values({
          amount,
          description: (() => {
            const { userId } = new ClerkAuth().getAuthFromRequest(request as any);
            return userId ? `[UID:${userId}] ${description}` : description;
          })(),
          gateway: 'sepay',
          id: orderCode,
          orderCode,
          status: 'pending',
        });
      } catch (e) {
        console.error('Failed to insert initial payment record:', e);
        // Continue; creation still succeeds for UI, webhook will try to update later
      }

      // Add formatted amount for display
      const responseData = {
        ...result.data,
        formattedAmount: sepayService.formatVNDAmount(amount),
      };

      console.log('Sepay payment created successfully:', {
        accountNumber: result.data.accountNumber,
        bankName: result.data.bankName,
        orderCode,
      });

      return NextResponse.json({
        data: responseData,
        error: 0,
        message: result.message,
      });
    } else {
      console.error('Sepay payment creation failed:', result.message);
      return NextResponse.json(
        {
          error: 1,
          message: result.message || 'Failed to create payment',
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error('Sepay create payment error:', error);
    return NextResponse.json(
      {
        error: 1,
        message: error.message || 'Internal server error',
      },
      { status: 500 },
    );
  }
}

// Get Sepay payment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderCode = searchParams.get('orderCode');

    if (!orderCode) {
      return NextResponse.json(
        {
          error: 1,
          message: 'Order code is required',
        },
        { status: 400 },
      );
    }

    // Query from database for live status
    try {
      const sepayService = new SepayService();

      const db = await getServerDB();
      const [row] = await db
        .select({
          amount: payments.amount,
          description: payments.description,
          orderCode: payments.orderCode,
          status: payments.status,
          transactionId: payments.transactionId,
        })
        .from(payments)
        .where(eq(payments.orderCode, orderCode));

      if (!row) {
        return NextResponse.json({ error: 1, message: 'Order not found' }, { status: 404 });
      }

      console.log('Sepay payment status retrieved:', {
        amount: row.amount ? sepayService.formatVNDAmount(row.amount) : 'N/A',
        orderCode,
        status: row.status,
      });

      // Prepare cleaned description without internal UID tag
      const stripUID = (s?: string | null) => (s ? s.replace(/^\[UID:[^\]]+]\s*/, '') : undefined);
      const cleanedDescription = stripUID(row.description);

      // Regenerate QR info for deep links / fresh tabs
      let bankName: string | undefined;
      let accountNumber: string | undefined;
      let qrCode: string | undefined;
      let paymentContent: string | undefined;
      try {
        if (typeof row.amount === 'number') {
          const regen = await sepayService.createPayment({
            amount: row.amount,
            description: row.description ?? '',
            orderCode,
          } as any);
          if (regen.success && regen.data) {
            bankName = regen.data.bankName;
            accountNumber = regen.data.accountNumber;
            qrCode = regen.data.qrCode;
            paymentContent = regen.data.paymentContent;
          }
        }
      } catch {}

      return NextResponse.json({
        data: {
          accountNumber,
          amount: row.amount,
          bankName,
          description: cleanedDescription,
          formattedAmount: row.amount ? sepayService.formatVNDAmount(row.amount) : null,
          orderCode,
          paymentContent:
            typeof orderCode === 'string'
              ? `${orderCode} ${cleanedDescription ?? ''}`
              : paymentContent,
          qrCode,
          status:
            row.status === 'completed'
              ? 'completed'
              : row.status === 'failed'
                ? 'failed'
                : 'pending',
          transactionId: row.transactionId ? Number(row.transactionId) : undefined,
        },
        error: 0,
        message: 'Payment status retrieved successfully',
      });
    } catch (e) {
      console.error('Error reading payment status from DB:', e);
      return NextResponse.json({ error: 1, message: 'DB error' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Sepay get payment status error:', error);
    return NextResponse.json(
      {
        error: 1,
        message: error.message || 'Internal server error',
      },
      { status: 500 },
    );
  }
}
