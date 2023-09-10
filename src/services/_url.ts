const isDev = process.env.NODE_ENV === 'development';

const prefix = isDev ? '-dev' : '';

export const URLS = {
  plugins: '/api/plugins' + prefix,
};

export const OPENAI_URLS = {
  chat: '/api/openai/chat' + prefix,
  models: '/api/openai/models' + prefix,
};

export const AZURE_OPENAI_URLS = {
  chat: '/api/azure-openai/chat' + prefix,
  models: '/api/azure-openai/models' + prefix,
};
