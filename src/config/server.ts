declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      ACCESS_CODE?: string;
      OPENAI_API_KEY?: string;
      OPENAI_PROXY_URL?: string;
    }
  }
}

export const getServerConfig = () => {
  if (typeof process === 'undefined') {
    throw new Error('[Server Config] you are importing a nodejs-only module outside of nodejs');
  }

  return {
    ACCESS_CODE: process.env.ACCESS_CODE,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_PROXY_URL: process.env.OPENAI_PROXY_URL,
  };
};
