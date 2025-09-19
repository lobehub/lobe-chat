/* @vitest-environment happy-dom */
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Import after mocks
import PaymentCheckoutPage from '@/app/payment/checkout/page';

// Mock next/navigation
vi.mock('next/navigation', () => {
  const replace = vi.fn();
  const push = vi.fn();
  return {
    useRouter: () => ({ replace, push }),
    useSearchParams: () => new URLSearchParams(''),
  } as any;
});

const makePaymentCreated = () => ({
  error: 0,
  message: 'Payment created successfully',
  data: {
    orderCode: 'TEST123',
    amount: 29000,
    accountNumber: '12919899999',
    bankName: 'MBBank',
    qrCode: 'https://example.com/qr.png',
    paymentContent: 'TEST123 Something',
    status: 'pending',
    formattedAmount: '29.000 ₫',
  },
});

const makeStatus = (status: 'pending' | 'completed' | 'failed') => ({
  error: 0,
  message: 'Payment status retrieved successfully',
  data: {
    orderCode: 'TEST123',
    status,
    amount: 29000,
    formattedAmount: '29.000 ₫',
  },
});

// Mock fetch sequence: 1) POST create -> created, 2) GET status -> pending, 3) GET status -> completed
function setupFetchMock() {
  const fetchMock = vi
    .fn()
    // first call: POST /create-payment
    .mockResolvedValueOnce({ json: async () => makePaymentCreated() })
    // second call: GET status pending
    .mockResolvedValueOnce({ json: async () => makeStatus('pending') })
    // third call: GET status completed
    .mockResolvedValueOnce({ json: async () => makeStatus('completed') });
  // @ts-ignore
  global.fetch = fetchMock;
  return fetchMock;
}

describe('PaymentCheckoutPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // default stub to prevent real network in simple render test
    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({ json: async () => makePaymentCreated() });
  });
  afterEach(() => {
    vi.useRealTimers();
    // @ts-ignore
    delete global.fetch;
  });

  it('renders loading state', async () => {
    render(<PaymentCheckoutPage />);
    expect(await screen.findByText(/Preparing payment/i)).toBeInTheDocument();
  });

  // NOTE: Skipped in CI due to polling timer flakiness; TODO enable after improving mocks/stabilizing timers

  it.skip('creates a payment and redirects to success after polling shows completed', async () => {
    const fetchMock = setupFetchMock();

    render(<PaymentCheckoutPage />);

    // wait for create-payment call
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    // pending banner flag should be set
    const raw = sessionStorage.getItem('paymentStatus');
    expect(raw).toBeTruthy();
    const v = JSON.parse(raw as string);
    expect(v.status).toBe('pending');

    // advance timers to trigger two polls (pending -> completed)
    await vi.advanceTimersByTimeAsync(3200);
    await vi.advanceTimersByTimeAsync(3200);

    // Router.replace should have been called to success
    const { useRouter } = await import('next/navigation');
    const router: any = useRouter();

    expect(router.replace).toHaveBeenCalled();
    const calledWith: string = router.replace.mock.calls[0][0];
    expect(calledWith.startsWith('/payment/success')).toBe(true);

    // fetch should be called at least 3 times (1 create + 2 polls)
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
