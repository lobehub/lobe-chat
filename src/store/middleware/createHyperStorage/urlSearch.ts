interface UrlSearchHelper {
  getUrlSearch: () => string;
  setUrlSearch: (params: URLSearchParams) => void;
}

export const createUrlSearch = (mode: 'search' | 'hash' = 'hash'): UrlSearchHelper => {
  if (mode === 'hash')
    return {
      getUrlSearch: () => location.hash.slice(1),
      setUrlSearch: (params: URLSearchParams) => (location.hash = params.toString()),
    };

  return {
    getUrlSearch: () => location.search.slice(1),
    setUrlSearch: (params: URLSearchParams) => (location.search = params.toString()),
  };
};
