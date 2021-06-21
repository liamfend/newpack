import axios from 'axios';
import cookies from 'js-cookie';
import { getItem } from '~base/global/helpers/storage';
import endpoints, { GRAPH_URL } from '~settings/endpoints';
import * as queries from '~settings/queries';
import { cookieNames } from '~constants';

export const getGraphQlHeader = () => ({
  Authorization: cookies.get(cookieNames.token)
    ? `Bearer ${cookies.get(cookieNames.token)}`
    : '',
  'Accept-Language': 'en-us',
});

const getCurrentRoleGraphQlHeader = () => {
  const authPayload = getItem('PMS_CURRENT_USER_AUTH');
  const header = {
    Authorization: cookies.get(cookieNames.token)
      ? `Bearer ${cookies.get(cookieNames.token)}`
      : '',
    'Accept-Language': 'en-us',
  };

  if (authPayload &&
    authPayload.payload &&
    authPayload.payload.currentRoleSlug) {
    header['Current-Role'] = authPayload.payload.currentRoleSlug;
  }

  return header;
};

export const checkUserExist = params =>
  axios({
    method: 'POST',
    url: endpoints.checkUserExist.url(),
    data: queries.checkUserExist(params),
    headers: getGraphQlHeader(),
  });

export const fetch = data => axios({
  method: 'POST',
  url: GRAPH_URL,
  data,
  headers: getCurrentRoleGraphQlHeader(),
}).then((res) => {
  if (res.data
      && !res.data.errors
      && res.data.data) {
    return res.data.data;
  }
  if (res.data && Array.isArray(res.data.errors) && res.data.errors[0]) {
    throw new Error(res.data.errors[0].message);
  }
  if (res.data && res.data.errors) {
    throw new Error(res.data.errors);
  }
  throw new Error('Update Failed');
});
