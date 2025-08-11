export interface Action {
  type?: string;
}

export const setNamespace = (namespace: string) => {
  return (action: string): string => `${namespace}/${action}`;
};
