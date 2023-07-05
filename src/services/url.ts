const isDevelopment = process.env.NODE_ENV === 'development';

const prefix = isDevelopment ? '-dev' : '';

export const URLS = {
  chain: '/api/chain' + prefix,
  openai: '/api/openai' + prefix,
};
