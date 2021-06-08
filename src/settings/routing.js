import queryString from 'query-string';
import routing from '~client/constants/routing';

const getPathFragment = (parentRoute, childRouteName) => {
  if (parentRoute[childRouteName]) {
    return {
      routeObject: parentRoute[childRouteName],
      path: parentRoute[childRouteName].path,
    };
  } else if (parentRoute.childRoutes[childRouteName]) {
    return {
      routeObject: parentRoute.childRoutes[childRouteName],
      path: parentRoute.childRoutes[childRouteName].path,
    };
  }

  throw new Error(`generatePath: Path not found for ${childRouteName}. Please check path exists`);
};

const getPathDivider = (path, currentRoute) => {
  if (path.charAt(path.length - 1) === '/' || currentRoute.charAt(0) === '/') {
    return '';
  }

  return '/';
};

const buildRoute = (name) => {
  const routeParts = name.split('.');
  let route = '';
  let routeObject = routing;

  for (let i = 0; i < routeParts.length; i++) {
    const currentRoute = getPathFragment(routeObject, routeParts[i]);
    const pathDivider = getPathDivider(route, currentRoute.path);
    route += `${pathDivider}${currentRoute.path}`;
    routeObject = currentRoute.routeObject;
  }

  // add starting '/' if it does not exist
  if (route.charAt(0) !== '/') {
    route = `/${route}`;
  }

  return route;
};

const generatePath = (name, params = {}, search = {}) => {
  if (typeof name !== 'string') {
    throw new Error('generatePath: name must be a dot-separated string');
  }

  let route = buildRoute(name);

  if (params) {
    Object.keys(params).map((key) => {
      route = route.replace(`{${key}}`, encodeURIComponent(params[key]));
      return true;
    });
  }

  if (Object.keys(search).length > 0) {
    route = `${route}?${queryString.stringify(search)}`;
  }

  return route;
};

export default generatePath;

