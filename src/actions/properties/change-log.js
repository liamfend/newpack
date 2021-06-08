import { message } from 'antd';
import { fetch } from '~actions/shared';
import endpoints from '~settings/endpoints';
import * as queries from '~settings/queries';
import i18n from '~settings/i18n';
import { formatSimpleParams } from '~helpers/params';
import { accountSortByMapping, sortDirectionMapping } from '~constants';
import { changeLogActionTypes as actions } from '~constants/actionTypes';

export const setPropertyChangeLogs = payload => ({
  type: actions.SET_PROPERTY_CHANGE_LOGS,
  payload: payload.property,
});

export const getPropertyChangeLogs = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getPropertyChangeLogs.url(),
    params: queries.getPropertyChangeLogs(params),
    communicationType: actions.GET_PROPERTY_CHANGE_LOGS_CS,
    successAction: setPropertyChangeLogs,
    onSuccess: (res) => {
      successCallback(res);
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const getChangeLogUserList = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getGeneralUrl.url(),
    params: queries.cmsUsers(formatSimpleParams(
      {
        pageNumber: 1,
        pageSize: 999,
        landlordSlugs: null,
        sortBy: accountSortByMapping.updatedAt,
        sortDirection: sortDirectionMapping.descend,
      },
      params,
    )),
    communicationType: actions.GET_CHANGE_LOGS_USER_LIST,
    onSuccess: (res) => {
      successCallback(res);
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};
