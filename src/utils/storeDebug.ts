export const setNamespace = (namespace: string) => {
  return (type: string, payload?: any) => {
    const name = [namespace, type].filter(Boolean).join('/');
    return payload
      ? {
          payload,
          type: name,
        }
      : name;
  };
};
