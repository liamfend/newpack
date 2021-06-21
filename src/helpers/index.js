import { trim } from 'lodash';
import getEnvironment, { environments } from '~base/global/helpers/environment';
import cookies from 'js-cookie';
import { List } from 'immutable';
import { getItem } from '~base/global/helpers/storage';
import { cookieNames } from '~client/constants';

const httpsRedirect = () => {
  if (getEnvironment() === environments.DEV) {
    return;
  }

  const location = window.location;

  if (location.protocol !== 'https:') {
    location.href = location.href.replace(location.protocol, 'https:');
  }
};
export default httpsRedirect;

export const generateSlug = name =>
  name.match(/[a-zA-Z]|[0-9]|\s/g)
    .reduce((result, item) => result + item)
    .replace(/\s/g, '-')
    .toLowerCase();

export const cloneObject = obj =>
  JSON.parse(JSON.stringify(obj));

export const htmlToString = (element) => {
  if (!element || !element.tagName) {
    return '';
  }
  let text;
  let node = document.createElement('div');
  node.appendChild(element.cloneNode(false));
  text = node.innerHTML;
  const string = text.indexOf('>') + 1;
  text = text.substring(0, string) + element.innerHTML + text.substring(string);
  node = null;
  return text;
};

export const renameObjectKey = (object, oldKey, newKey) => {
  if (oldKey !== newKey && Object.prototype.hasOwnProperty.call(object, oldKey)) {
    Object.defineProperty(object, newKey,
      Object.getOwnPropertyDescriptor(object, oldKey));
    delete object[oldKey]; // eslint-disable-line no-param-reassign
  }
  return object;
};


export const mergeWithoutList = (a, b) => {
  const isList = List.isList;
  if (a && a.mergeWith && !isList(a) && !isList(b)) {
    return a.mergeWith(mergeWithoutList, b);
  }
  return b;
};

export const getHeader = () => {
  const authorization = `Bearer ${cookies.get(cookieNames.token)}`;
  const headers = {
    Authorization: authorization,
    'Accept-Language': 'en-us',
  };
  const authPayload = getItem('PMS_CURRENT_USER_AUTH');

  if (authPayload && authPayload.payload && authPayload.payload.currentRoleSlug) {
    headers['Current-Role'] = authPayload.payload.currentRoleSlug;
  }

  return headers;
};

export const camelCaseToUpperFisrtCase = (string) => {
  if (typeof string === 'string') {
    // Add ' ' to upper charater
    const newString = string.replace(/([a-z])([A-Z])/g, '$1 $2');
    return newString.charAt(0).toUpperCase() + newString.slice(1);
  }
  return string;
};

export const showPassportName = (student) => {
  const {
    passportFirstName,
    passportLastName,
    passportMiddleName,
    firstName,
    lastName,
  } = student;
  if (passportFirstName || passportLastName || passportMiddleName) {
    return trim(`${passportFirstName || ''} ${passportMiddleName || ''} ${passportLastName || ''}`);
  }

  return trim(`${firstName || ''} ${lastName || ''}`);
};
