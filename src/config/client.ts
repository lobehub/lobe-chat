declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      USE_AZURE_OPENAI?: boolean;
    }
  }
}

export const getClientConfig = () => {
  return {
    USE_AZURE_OPENAI: process.env.USE_AZURE_OPENAI,
  };
};
