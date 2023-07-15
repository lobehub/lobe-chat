const isDev = process.env.NODE_ENV === 'development';

const prefix = isDev ? '-dev' : '';

export const URLS = {
  chain: '/api/chain' + prefix,
  openai: '/api/openai' + prefix,
};
