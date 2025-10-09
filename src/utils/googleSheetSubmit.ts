import { ssrfSafeFetch } from '../../../packages/ssrf-safe-fetch';

interface CommonData {
  name: string;
  company?: string;
  linkedIn?: string;
  notes?: string;
  status?: string;
  followUpDate?: string;
  contactInterval?: string;
}

export async function submitToGoogleSheet(
  endpoint: 'follow_up' | 'dont_follow_up' | 'keep_warm',
  data: CommonData
) {
  const url = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  const key = process.env.SHEET_API_KEY;
  if (!url || !key) {
    throw new Error('Missing GOOGLE_SHEET_WEBHOOK_URL or SHEET_API_KEY environment variable');
  }
  const payload = { key, endpoint, ...data };
  try {
    const response = await ssrfSafeFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Google Sheet submission failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Google Sheet submission error: ${error}`);
  }
}
