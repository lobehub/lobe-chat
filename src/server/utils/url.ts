import urlJoin from 'url-join';

const isVercelPreview = process.env.VERCEL === '1' && process.env.VERCEL_ENV !== 'production';

const vercelPreviewUrl = `https://${process.env.VERCEL_URL}`;

const siteUrl = isVercelPreview ? vercelPreviewUrl : 'https://si.icu';

export const getCanonicalUrl = (...paths: string[]) => urlJoin(siteUrl, ...paths);
