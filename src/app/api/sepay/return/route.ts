import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';

import { getServerDB } from '@/database/core/db-adaptor';
import { payments } from '@/database/schemas';
import SepayService from '@/services/sepay';

// Handle Sepay return URL after payment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Sepay return parameters (these may vary based on your implementation)
    const orderCode = searchParams.get('orderCode');
    const status = searchParams.get('status');
    const amount = searchParams.get('amount');

    console.log('Sepay return URL accessed:', {
      amount,
      orderCode,
      status,
    });

    if (!orderCode) {
      // Redirect to error page if no order code
      return redirect('/payment/error?reason=missing_order_code');
    }

    // Initialize Sepay service (for formatting only)
    const sepayService = new SepayService();

    try {
      // Query payment from DB
      const db = await getServerDB();
      const [row] = await db
        .select({
          amount: payments.amount,
          status: payments.status,
        })
        .from(payments)
        .where(eq(payments.orderCode, orderCode));

      if (row) {
        const paymentStatus = row.status;
        const paymentAmount = row.amount;

        // Handle different payment statuses
        switch (paymentStatus) {
          case 'completed': {
            // Payment completed successfully
            console.log(
              `Payment completed for order ${orderCode}: ${paymentAmount ? sepayService.formatVNDAmount(paymentAmount) : 'N/A'}`,
            );

            return redirect(
              `/payment/success?orderCode=${orderCode}&amount=${paymentAmount || amount}&status=completed`,
            );
          }

          case 'pending': {
            // Payment is still pending (waiting for webhook confirmation)
            console.log(`Payment pending for order ${orderCode}`);
            return redirect(
              `/payment/pending?orderCode=${orderCode}&amount=${paymentAmount || amount}`,
            );
          }

          case 'failed': {
            // Payment failed
            console.log(`Payment failed for order ${orderCode}`);
            return redirect(`/payment/failed?orderCode=${orderCode}`);
          }

          default: {
            // Unknown status - treat as pending
            console.log(`Unknown payment status for order ${orderCode}: ${paymentStatus}`);
            return redirect(
              `/payment/pending?orderCode=${orderCode}&amount=${paymentAmount || amount}&status=unknown`,
            );
          }
        }
      } else {
        // Failed to get payment information - treat as pending
        console.log(`Could not retrieve payment info for order ${orderCode}, treating as pending`);
        return redirect(
          `/payment/pending?orderCode=${orderCode}&amount=${amount}&reason=info_unavailable`,
        );
      }
    } catch (error) {
      console.error('Error getting payment information:', error);
      return redirect(
        `/payment/pending?orderCode=${orderCode}&amount=${amount}&reason=service_error`,
      );
    }
  } catch (error: any) {
    console.error('Sepay return URL error:', error);
    return redirect('/payment/error?reason=processing_error');
  }
}

// Handle POST requests (not typically used for return URLs)
export async function POST() {
  return NextResponse.json(
    {
      message: 'Method not allowed. Use GET for return URLs.',
      success: false,
    },
    { status: 405 },
  );
}
