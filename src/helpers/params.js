/**
 * Format params with single structure and remove all undefined data
 *
 * @param Object paramsList
 * @param Object data
 * @returns {{}}
 */
export const formatSimpleParams = (defaultParams, data, excludeParams = []) => {
  const formatted = {};
  Object.keys(defaultParams).map((item) => {
    if (excludeParams.indexOf(item) !== -1) {
      formatted[item] = data[item] || defaultParams[item];
      return true;
    }

    if (typeof data[item] === 'undefined'
      || data[item] === null
      || (data[item] && data[item].length === 0)
    ) {
      // Handle if item is empty
      if (defaultParams[item] !== null) {
        formatted[item] = defaultParams[item];
      }
    } else {
      formatted[item] = data[item];
    }
    return true;
  });

  return formatted;
};

export const secondFunction = () => {

};
