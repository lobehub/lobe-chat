import { timingSafeEqual } from 'node:crypto';

// Sepay configuration interface
interface SepayConfig {
  accountNumber: string;
  apiKey: string;
  bankName: string;
}

// Payment data interface for Sepay
interface PaymentData {
  amount: number;
  buyerEmail?: string;
  buyerName?: string;
  buyerPhone?: string;
  cancelUrl?: string;
  description: string;
  orderCode: string;
  returnUrl?: string;
}

// Payment response interface
interface PaymentResponse {
  data?: {
    accountNumber: string;
    amount: number;
    bankName: string;
    orderCode: string;
    paymentContent: string;
    qrCode: string;
    status: 'pending' | 'completed' | 'failed';
  };
  message: string;
  success: boolean;
}

// Sepay webhook data interface (based on official documentation)
interface SepayWebhookData {
  // Thời gian xảy ra giao dịch phía ngân hàng
  accountNumber: string;
  // Số tiền giao dịch
  accumulated: number;
  // Số tài khoản ngân hàng
  code: string | null;
  // Mã code thanh toán (sepay tự nhận diện)
  content: string;
  // Mã tham chiếu của tin nhắn sms
  description: string;
  // ID giao dịch trên SePay
  gateway: string;
  id: number;
  // Tài khoản ngân hàng phụ
  referenceCode: string;
  // Số dư tài khoản (lũy kế)
  subAccount: string | null;
  // Brand name của ngân hàng
  transactionDate: string;
  // Loại giao dịch. in là tiền vào, out là tiền ra
  transferAmount: number;
  // Nội dung chuyển khoản
  transferType: 'in' | 'out'; // Toàn bộ nội dung tin nhắn sms
}

/**
 * Sepay Service for Vietnamese Payment Processing
 *
 * This service handles Sepay payment integration using webhook-based verification.
 * Sepay is a Vietnamese payment gateway that supports bank transfers and QR code payments.
 */
class SepayService {
  private config: SepayConfig;

  constructor() {
    this.config = {
      accountNumber: process.env.SEPAY_ACCOUNT_NUMBER || '',
      apiKey: process.env.SEPAY_API_KEY || '',
      bankName: process.env.SEPAY_BANK_NAME || 'Vietcombank',
    };

    if (!this.config.apiKey) {
      throw new Error('SEPAY_API_KEY environment variable is required');
    }

    if (!this.config.accountNumber) {
      throw new Error('SEPAY_ACCOUNT_NUMBER environment variable is required');
    }
  }

  /**
   * Generate a unique order code for payment tracking
   */
  generateOrderCode(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `LC${timestamp}${random}`;
  }

  /**
   * Create a payment request for Sepay
   * Note: Sepay uses webhook-based verification, so we create payment info for display
   */
  async createPayment(paymentData: PaymentData): Promise<PaymentResponse> {
    try {
      const { orderCode, amount, description } = paymentData;

      // Generate payment content for bank transfer
      const paymentContent = `${orderCode} ${description}`;

      // Generate QR code data for Vietnamese banking
      const qrData = this.generateQRCode(amount, paymentContent);

      return {
        data: {
          accountNumber: this.config.accountNumber,
          amount,
          bankName: this.config.bankName,
          orderCode,
          paymentContent,
          qrCode: qrData,
          status: 'pending',
        },
        message: 'Payment created successfully',
        success: true,
      };
    } catch (error: any) {
      console.error('Sepay payment creation error:', error);
      return {
        message: error.message || 'Failed to create payment',
        success: false,
      };
    }
  }

  /**
   * Generate QR code data for Vietnamese banking (VietQR standard)
   */
  private generateQRCode(amount: number, content: string): string {
    // This would typically integrate with VietQR API or generate QR data
    // For now, we'll create a placeholder QR data structure
    const qrData = {
      accountNumber: this.config.accountNumber,
      amount: amount,
      bankCode: this.getBankCode(this.config.bankName),
      content: content,
      template: 'compact2',
    };

    // In production, this would call VietQR API to generate actual QR code
    return `https://img.vietqr.io/image/${qrData.bankCode}-${qrData.accountNumber}-${qrData.template}.png?amount=${qrData.amount}&addInfo=${encodeURIComponent(qrData.content)}`;
  }

  /**
   * Get bank code for VietQR
   */
  private getBankCode(bankName: string): string {
    /* eslint-disable sort-keys-fix/sort-keys-fix */

    const bankCodes: { [key: string]: string } = {
      ACB: '970416',
      Agribank: '970405',
      BIDV: '970418',
      HDBank: '970437',
      MBBank: '970422',
      OCB: '970448',
      Eximbank: '970431',
      SHB: '970443',
      CAKE: '546034',
      Vietcombank: '970436',
      MSB: '970426',
      VietinBank: '970415',
      SCB: '970429',
      NamABank: '970428',
      TPBank: '970423',
      PGBank: '970430',
      Techcombank: '970407',
      BaoVietBank: '970438',
      VPBank: '970432',
      COOPBANK: '970446',
      Sacombank: '970403',
      KienLongBank: '970452',
      VIB: '970441',
      KBank: '668888',
      LienVietPostBank: '970449',
      Timo: '963388',
      SeABank: '970440',
      Ubank: '546035',
      VietABank: '970427',
      VietCapitalBank: '970454',
      VietBank: '970433',
    };

    /* eslint-enable sort-keys-fix/sort-keys-fix */

    return bankCodes[bankName] || '970436'; // Default to Vietcombank
  }

  /**
   * Verify Sepay webhook data
   * Sepay uses API Key authentication in the Authorization header
   */
  verifyWebhook(authHeader: string | null): boolean {
    if (!authHeader) return false;

    // Normalize scheme to 'Apikey ' while preserving the secret portion exactly
    const normalized = authHeader.replace(/^apikey\s/i, 'Apikey ');
    const expected = `Apikey ${this.config.apiKey}`;

    const a = Buffer.from(normalized, 'utf8');
    const b = Buffer.from(expected, 'utf8');

    if (a.length !== b.length) return false;

    try {
      return timingSafeEqual(a, b);
    } catch {
      return false;
    }
  }

  /**
   * Process webhook data from Sepay
   */
  processWebhookData(webhookData: SepayWebhookData): {
    amount: number;
    isValid: boolean;
    orderCode: string | null;
    status: 'success' | 'failed';
    transactionId: number;
  } {
    try {
      // Extract order code from payment content
      const orderCode = this.extractOrderCode(webhookData.content);

      // Determine payment status
      const status = webhookData.transferType === 'in' ? 'success' : 'failed';

      return {
        amount: webhookData.transferAmount,
        isValid: true,
        orderCode,
        status,
        transactionId: webhookData.id,
      };
    } catch (error) {
      console.error('Error processing webhook data:', error);
      return {
        amount: 0,
        isValid: false,
        orderCode: null,
        status: 'failed',
        transactionId: 0,
      };
    }
  }

  /**
   * Extract order code from payment content
   */
  private extractOrderCode(content: string): string | null {
    // Look for order code pattern: LC followed by timestamp and random number
    const match = content.match(/LC\d+/);
    return match ? match[0] : null;
  }

  /**
   * Format Vietnamese currency (VND)
   */
  formatVNDAmount(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      currency: 'VND',
      minimumFractionDigits: 0,
      style: 'currency',
    }).format(amount);
  }

  /**
   * Get payment status by order code
   *
   * NOTE: STUB implementation — does NOT query the database and always returns 'pending'.
   * TODO: Implement DB lookup for the given order code and return real status/amount/txId.
   */
  async getPaymentStatus(): Promise<{
    amount?: number;
    status: 'pending' | 'completed' | 'failed';
    success: boolean;
    transactionId?: number;
  }> {
    // STUB: Replace with actual database query logic.
    return {
      status: 'pending',
      success: true,
    };
  }

  /**
   * Validate payment amount and order code
   */
  validatePayment(orderCode: string, amount: number, expectedAmount: number): boolean {
    // Check if amounts match (allow small variance for fees)
    const amountDifference = Math.abs(amount - expectedAmount);
    const percentVariance = expectedAmount * 0.01; // 1% variance allowed
    const minVarianceVND = 1000; // minimum allowed variance (cap for small payments)
    const allowedVariance = Math.max(percentVariance, minVarianceVND);

    return amountDifference <= allowedVariance;
  }
}

export default SepayService;
export type { PaymentData, PaymentResponse, SepayConfig, SepayWebhookData };
