/** Keep OAuth redirects on the server; route account requests through the authenticated desktop proxy. */
export const desktopAccountFetch: typeof fetch = (input, init) => {
  const url = new URL(input instanceof Request ? input.url : input.toString());
  if (url.pathname === '/api/auth/change-email' || url.pathname === '/api/auth/list-accounts') {
    const target = `app://renderer${url.pathname}${url.search}`;
    return fetch(input instanceof Request ? new Request(target, input) : target, init);
  }
  return fetch(input, init);
};
