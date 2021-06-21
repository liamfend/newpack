import queryString from 'query-string';

/**
 * Build new url search params.
 * Functionality 1: merge new params into current params
 * Functionality 2: remove all empty params and default params defined in defaultParams
 *
 * @param Object newParams
 * @param Object defaultParams
 * @returns {String}
 */
export const mergeSearchParams = (newParams, defaultParams) => {
  const params = Object.assign({}, queryString.parse(window.location.search), newParams);

  Object.keys(params).map((key) => {
    if (
      !params[key]
      || params[key] === 0
      || params[key] === defaultParams[key]
      || params.length === 0
    ) {
      delete params[key];
    }

    return true;
  });

  return `?${queryString.stringify(params)}`;
};

export const extractSearchParams = (searchParams) => {
  if (!searchParams) return { type: null, slug: null };
  const splitIndex = searchParams.indexOf('_');
  if (splitIndex) {
    return {
      type: searchParams.substr(0, splitIndex),
      slug: searchParams.substr(splitIndex + 1, searchParams.length - splitIndex - 1),
    };
  }
  return { type: null, slug: null };
};

