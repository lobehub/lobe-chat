import { and, eq, ne } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { getServerDB } from '@/database/core/db-adaptor';
import { payments, subscriptions } from '@/database/schemas';
import SepayService, { SepayWebhookData } from '@/services/sepay';

// Handle successful payment
async function handleSuccessfulPayment(data: {
  amount: number;
  gateway: string;
  gatewayResponse: any;
  orderCode: string;
  referenceCode: string;
  transactionDate: string;
  transactionId: number;
}) {
  try {
    console.log('Processing successful payment:', {
      amount: data.amount,
      gateway: data.gateway,
      orderCode: data.orderCode,
      transactionId: data.transactionId,
    });

    const db = await getServerDB();
    // 1) Update payment record (idempotent: do not override completed)
    const updated = await db
      .update(payments)
      .set({
        gateway: data.gateway,
        gatewayResponse: data.gatewayResponse as any,
        paidAt: new Date() as any,
        referenceCode: data.referenceCode,
        status: 'completed',
        transactionDate: data.transactionDate,
        transactionId: String(data.transactionId),
      })
      .where(and(eq(payments.orderCode, data.orderCode), ne(payments.status, 'completed')))
      .returning({ id: payments.id });

    // 1b) If no existing row to update, insert a new completed record (upsert-if-missing)
    if (!updated || updated.length === 0) {
      await db.insert(payments).values({
        amount: data.amount,
        description:
          (data as any)?.gatewayResponse?.description ??
          (data as any)?.gatewayResponse?.content ??
          null,
        gateway: data.gateway,
        gatewayResponse: data.gatewayResponse as any,
        id: data.orderCode,
        orderCode: data.orderCode,
        paidAt: new Date() as any,
        referenceCode: data.referenceCode,
        status: 'completed',
        transactionDate: data.transactionDate,
        transactionId: String(data.transactionId),
      });
    }

    // 2) Derive userId from webhook content (embedded UID tag in description)
    const content: string | undefined = (data.gatewayResponse as any)?.content;
    const uidMatch = content?.match(/\[UID:([^\]]+)]/);
    const userId = uidMatch?.[1];

    if (userId) {
      // expire existing active subscriptions
      await db
        .update(subscriptions)
        .set({ status: 'expired' })
        .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')));

      // create new active subscription for 30 days
      const now = new Date();
      const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await db.insert(subscriptions).values({
        currentPeriodEnd: end as any,
        currentPeriodStart: now as any,
        id: data.orderCode,
        paymentOrderCode: data.orderCode,
        plan: 'premium',
        status: 'active',
        userId,
      });

      console.log('Subscription activated for user:', userId);
    } else {
      console.warn('No UID tag found in webhook content; subscription not created');
    }

    console.log('Successful payment processed and stored (idempotent):', data.orderCode);
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
}

// Handle failed payment
async function handleFailedPayment(data: {
  amount: number;
  gatewayResponse: any;
  orderCode: string | null;
  reason: string;
  transactionId: number;
}) {
  try {
    console.log('Processing failed payment:', {
      amount: data.amount,
      orderCode: data.orderCode,
      reason: data.reason,
      transactionId: data.transactionId,
    });

    if (data.orderCode) {
      const db = await getServerDB();
      await db
        .update(payments)
        .set({
          gatewayResponse: data.gatewayResponse as any,
          status: 'failed',
          transactionId: String(data.transactionId),
        })
        .where(and(eq(payments.orderCode, data.orderCode), ne(payments.status, 'completed')));
    }

    console.log('Failed payment processed (no override of completed):', data.orderCode);
  } catch (error) {
    console.error('Error handling failed payment:', error);
    throw error;
  }
}

// Handle Sepay webhook notifications
export async function POST(request: NextRequest) {
  try {
    // Get authorization header for API key verification
    const authHeader = request.headers.get('authorization');

    // Initialize Sepay service
    const sepayService = new SepayService();

    // Verify webhook authenticity using API key
    if (!sepayService.verifyWebhook(authHeader)) {
      console.error('Sepay webhook verification failed:', {
        authHeader: authHeader ? 'Present' : 'Missing',
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          message: 'Unauthorized webhook request',
          success: false,
        },
        { status: 401 },
      );
    }

    // Parse webhook data
    const webhookData: SepayWebhookData = await request.json();

    console.log('Sepay webhook received:', {
      content: webhookData.content,
      gateway: webhookData.gateway,
      id: webhookData.id,
      transactionDate: webhookData.transactionDate,
      transferAmount: sepayService.formatVNDAmount(webhookData.transferAmount),
      transferType: webhookData.transferType,
    });

    // Process webhook data
    const processedData = sepayService.processWebhookData(webhookData);

    if (!processedData.isValid) {
      console.error('Invalid webhook data received:', webhookData);
      return NextResponse.json(
        {
          message: 'Invalid webhook data',
          success: false,
        },
        { status: 400 },
      );
    }

    // Handle different payment statuses
    if (processedData.status === 'success' && processedData.orderCode) {
      await handleSuccessfulPayment({
        amount: processedData.amount,
        gateway: webhookData.gateway,
        gatewayResponse: webhookData,
        orderCode: processedData.orderCode,
        referenceCode: webhookData.referenceCode,
        transactionDate: webhookData.transactionDate,
        transactionId: processedData.transactionId,
      });
    } else {
      await handleFailedPayment({
        amount: processedData.amount,
        gatewayResponse: webhookData,
        orderCode: processedData.orderCode,
        reason: 'Transfer type is not "in" or order code not found',
        transactionId: processedData.transactionId,
      });
    }

    // Return success response as required by Sepay
    return NextResponse.json(
      {
        message: 'Webhook processed successfully',
        success: true,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('Sepay webhook processing error:', error);

    // Return error response
    return NextResponse.json(
      {
        message: 'Webhook processing failed',
        success: false,
      },
      { status: 500 },
    );
  }
}

// Handle GET requests (not typically used for webhooks)
export async function GET() {
  return NextResponse.json(
    {
      message: 'Method not allowed. Use POST for webhooks.',
      success: false,
    },
    { status: 405 },
  );
}
