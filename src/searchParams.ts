// A custom storage implementation that uses URL search parameters to store data.

const getSearchParams = () => {
  return new URL(location.href).searchParams;
};

const updateSearchParams = (searchParams: URLSearchParams) => {
  window.history.replaceState(
    {},
    "",
    `${location.pathname}?${searchParams.toString()}`,
  );
};

const getSearchParam = (key: string) => {
  const searchParams = getSearchParams();
  return searchParams.get(key);
};

const updateSearchParam = (key: string, value: string) => {
  const searchParams = getSearchParams();
  searchParams.set(key, value);

  updateSearchParams(searchParams);
};

const removeSearchParam = (key: string) => {
  const searchParams = getSearchParams();
  searchParams.delete(key);

  updateSearchParams(searchParams);
};

export const searchParamsStorage = {
  getItem: (key: string) => getSearchParam(key),
  setItem: (key: string, value: string) => updateSearchParam(key, value),
  removeItem: (key: string) => removeSearchParam(key),
};
