export const handleReplicateError = (error: any) => {
  let errorMessage = 'Unknown error';
  let errorType = 'provider_error';

  if (error?.message) {
    errorMessage = error.message;
  }

  if (error?.response?.data?.detail) {
    errorMessage = error.response.data.detail;
  }

  return {
    errorResult: {
      message: errorMessage,
      type: errorType,
    },
  };
};
