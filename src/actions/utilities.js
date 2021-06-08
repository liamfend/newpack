import { message } from 'antd';
import i18n from '~settings/i18n';
import { fetch } from '~actions/shared';
import { sortDirectionMapping, sortByMapping } from '~constants';
import endpoints from '~settings/endpoints';
import { formatSimpleParams } from '~helpers/params';
import * as queries from '~settings/queries';

export const setAccountOwners = (data, actionTypes) => ({
  type: actionTypes.SET_ACCOUNT_OWNERS,
  data,
});

export const fetchAccountOwners = (actionTypes, params, successCallback = () => {}, dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getGeneralUrl.url(),
    params: queries.getAccoutOwners(formatSimpleParams(
      {
        pageNumber: 1,
        pageSize: 999,
        landlordSlugs: null,
        sortBy: sortByMapping.updatedAt,
        sortDirection: sortDirectionMapping.descend,
        includeRoleSlugs: null,
      },
      params,
    )),
    communicationType: actionTypes.GET_ACCOUNT_OWNER_CS,
    successAction: data => setAccountOwners(data, actionTypes),
    onSuccess: () => { successCallback(); },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};
