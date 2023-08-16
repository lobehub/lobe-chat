const isDev = process.env.NODE_ENV === 'development';

const prefix = isDev ? '-dev' : '';

export const URLS = {
  openai: '/api/openai' + prefix,
  plugins: '/api/plugins',
};
