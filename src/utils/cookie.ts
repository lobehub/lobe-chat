export const setCookie = (key: string, value: string | undefined) => {
  // eslint-disable-next-line unicorn/no-document-cookie
  document.cookie = `${key}=${value};path=/;`;
};
