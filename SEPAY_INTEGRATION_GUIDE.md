# Sepay Integration Guide for LobeChat Vietnam Market

This guide provides comprehensive instructions for integrating Sepay payment gateway into LobeChat for Vietnamese customers.

## Overview

Sepay is a leading Vietnamese payment gateway that specializes in:

- **Webhook-Based Verification**: Effortless automatic payment confirmation
- **Bank Transfer Integration**: Direct integration with Vietnamese banks
- **QR Code Payments**: VietQR standard for mobile payments
- **Real-time Notifications**: Instant payment verification via webhooks
- **Mobile Optimization**: Perfect for Vietnam's mobile-first banking

## Prerequisites

### 1. Sepay Account Setup

1. Visit <https://my.sepay.vn/>
2. Register for a Sepay merchant account
3. Complete business verification and bank account linking
4. Obtain your credentials:
   - `API Key`
   - Bank account number
   - Configure webhook endpoints

### 2. No Additional Dependencies Required

Sepay integration uses webhook-based verification, so no external SDKs are needed.

## Environment Configuration

Add the following variables to your `.env.development` or `.env.local` file:

```env
# Sepay Configuration
SEPAY_API_KEY=your_sepay_api_key_here
SEPAY_ACCOUNT_NUMBER=your_bank_account_number_here
SEPAY_BANK_NAME=Vietcombank

# Optional: Custom webhook URL for production
SEPAY_WEBHOOK_URL=https://yourdomain.com/api/sepay/webhook
```

### Production Deployment Checklist

- Never commit real secrets. `.env.local` and `.env*.local` are already gitignored.
- Required server-side variables:
  - `SEPAY_API_KEY`
  - `SEPAY_ACCOUNT_NUMBER`
  - `SEPAY_BANK_NAME`
- Configure webhook URL in Sepay dashboard to: `<your-domain>/api/sepay/webhook`.
- Rotate API keys before going live and store them in your platform's secret manager.
- Ensure the payments table migration is applied and the `/api/sepay/webhook` endpoint is publicly reachable over HTTPS.

## Implementation Components

### 1. Sepay Service (`src/services/sepay.ts`)

Core service handling Sepay integration:

- Payment information generation
- QR code creation (VietQR standard)
- Webhook signature verification
- Vietnamese currency formatting
- Order code generation and validation

### 2. API Routes

#### Create Payment (`/api/sepay/create-payment`)

- **Method**: POST
- **Purpose**: Generate payment information and QR codes
- **Request Body**:

```json
{
  "amount": 29000,
  "buyerEmail": "user@example.com",
  "buyerName": "Nguyen Van A",
  "buyerPhone": "+84901234567",
  "description": "LobeChat Premium Subscription"
}
```

#### Webhook Handler (`/api/sepay/webhook`)

- **Method**: POST
- **Purpose**: Secure payment verification and order processing
- **Security**: API Key verification in Authorization header
- **Actions**: Update order status, activate subscriptions, send notifications

#### Return URL Handler (`/api/sepay/return`)

- **Method**: GET
- **Purpose**: Handle user return after payment
- **Flow**: Check payment status → Redirect to appropriate page

### 3. React Component (`src/components/SepayPayment/SepayPaymentButton.tsx`)

User-friendly payment button with:

- Vietnamese language interface
- QR code display modal
- Bank transfer information
- Copy-to-clipboard functionality
- Mobile-optimized design

## Usage Examples

### Basic Payment Button

```tsx
import SepayPaymentButton from '@/components/SepayPayment/SepayPaymentButton';

function SubscriptionPage() {
  return (
    <SepayPaymentButton
      amount={29000}
      description="LobeChat Premium - 1 tháng"
      buyerEmail="user@example.com"
      onSuccess={(orderCode) => {
        console.log('Payment initiated:', orderCode);
        // Handle success (payment info displayed to user)
      }}
      onError={(error) => {
        console.error('Payment error:', error);
        // Handle error
      }}
    />
  );
}
```

### Advanced Usage with Customer Info

```tsx
<SepayPaymentButton
  amount={58000}
  description="LobeChat Premium Package"
  buyerName="Nguyen Van A"
  buyerEmail="user@example.com"
  buyerPhone="+84901234567"
  onSuccess={(orderCode) => {
    // Redirect to pending page
    router.push(`/payment/pending?orderCode=${orderCode}`);
  }}
/>
```

## Payment Flow

### 1. User Initiates Payment

```
User clicks Sepay button → API creates payment info → QR code & bank details displayed
```

### 2. User Completes Payment

```
User scans QR or transfers manually → Bank processes payment → Sepay detects transaction
```

### 3. Payment Verification

```
Sepay sends webhook → API Key verified → Order status updated → User notified
```

### 4. Security Model

- **Return URL**: Shows payment status to user (pending confirmation)
- **Webhook**: Authoritative payment confirmation (secure, server-side)
- **API Key Authentication**: Sepay uses "Authorization: Apikey YOUR_API_KEY" header

## Testing

### 1. Sepay Sandbox

Sepay provides a sandbox environment for testing:

- Register at <https://my.dev.sepay.vn/>
- Use sandbox credentials for development
- Create simulated transactions for testing
- Contact Sepay support to activate sandbox account

### 2. Test Scenarios

```bash
# Test payment creation
curl -X POST http://localhost:3010/api/sepay/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 29000,
    "description": "Test Payment",
    "buyerName": "Test User",
    "buyerEmail": "test@example.com"
  }'

# Test webhook (simulate Sepay webhook)
curl -X POST http://localhost:3010/api/sepay/webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Apikey your_api_key_here" \
  -d '{
    "id": 92704,
    "gateway": "Vietcombank",
    "transactionDate": "2023-03-25 14:02:37",
    "accountNumber": "0123499999",
    "code": "LC1234567890123",
    "content": "LC1234567890123 LobeChat Premium",
    "transferType": "in",
    "transferAmount": 29000,
    "accumulated": 19077000,
    "subAccount": null,
    "referenceCode": "MBVCB.3278907687",
    "description": "Full SMS content"
  }'
```
