import { safeFetch } from "@/packages/ssrf-safe-fetch";

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
  const url = process.env.GOOGLE_SHEET_WEBHOOK_URL!;
  const key = process.env.SHEET_API_KEY!;
  const payload = { key, endpoint, ...data };

  const res = await safeFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return res;
}
