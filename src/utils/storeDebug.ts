export const setNamespace = (namespace: string) => {
  return <P = undefined>(type: string, payload?: P) => {
    const name = [namespace, type].filter(Boolean).join('/');
    return (
      payload
        ? {
            payload,
            type: name,
          }
        : name
    ) as P extends undefined ? string : { type: string; payload: P };
  };
};

export type Action =
  | string
  | {
      type: string;
      [x: string | number | symbol]: unknown;
    };
