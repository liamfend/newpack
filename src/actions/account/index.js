import jwtDecode from 'jwt-decode';
import { fetch } from '~actions/shared';
import endpoints from '~settings/endpoints';
import cookies from 'js-cookie';
import * as queries from '~settings/queries';
import { cookieNames, accountSortByMapping, sortDirectionMapping } from '~constants';
import { message } from 'antd';
import i18n from '~settings/i18n';
import { formatSimpleParams } from '~helpers/params';
import { accountActionTypes as actions } from '~constants/actionTypes';


export const setCmsUser = payload => ({
  type: actions.SET_CMS_USER,
  payload: payload.cmsUser,
});


export const getLandlordList = (onSuccess = () => {}) => (dispatch) => {
  const query = queries.searchLandlordList(
    {
      pageNumber: 1,
      pageSize: 9999,
      query: '',
    },
  );
  fetch({
    dispatch,
    endpoint: endpoints.getLandlordList.url(),
    params: query,
    communicationType: actions.LANDLORD_LIST_CS,
    onSuccess: (res) => {
      onSuccess(res);
    },
  });
};

export const getCmsUser = (onSuccess = () => {}) => (dispatch) => {
  const info = jwtDecode(cookies.get(cookieNames.token));

  if (info && info.uuid) {
    fetch({
      dispatch,
      endpoint: endpoints.getGeneralUrl.url(),
      params: queries.getCmsUser({ userUuid: info.uuid }),
      communicationType: actions.GET_CMS_USER_CS,
      onSuccess: (res) => {
        onSuccess(res);
      },
      successAction: setCmsUser,
    });
  } else {
    message.error(i18n.t('cms.properties.edit.toast.error'));
  }
};

export const createAccount = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getGeneralUrl.url(),
    params: queries.createAccount(formatSimpleParams(
      {
        email: null,
        firstName: null,
        landlordId: null,
        lastName: null,
        password: null,
        roles: [],
        signupType: null,
      },
      params,
    )),
    communicationType: actions.CREATE_CS,
    onError: () => {
      message.error(i18n.t('cms.account.create_error.tips'));
    },
    onSuccess: () => {
      message.success(i18n.t('cms.account.create_success.tips'));
      successCallback();
    },
  });
};

export const updateAccount = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getGeneralUrl.url(),
    params: queries.updateAccount(params),
    communicationType: actions.UPDATE_CS,
    onError: () => {
      message.error(i18n.t('cms.account.update_error.tips'));
    },
    onSuccess: (res) => {
      message.success(i18n.t('cms.account.update_success.tips'));
      successCallback(res);
    },
  });
};

export const setUserList = payload => ({
  type: actions.SET_LIST,
  payload: payload.cmsUsers,
});

export const getUserList = params => (dispatch) => {
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
    communicationType: actions.LIST_CS,
    successAction: setUserList,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const setLandlordList = payload => ({
  type: actions.SET_ACCOUNT_LANDLORD_LIST,
  payload: payload.landlordContacts,
});

export const getLandlordContacts = (params, onSuccess = () => {}) => (dispatch) => {
  const newParams = params;
  if (newParams.searchContent) {
    newParams.searchFields = ['EMAIL'];
  }

  fetch({
    dispatch,
    endpoint: endpoints.getGeneralUrl.url(),
    params: queries.getLandlordContacts(formatSimpleParams(
      {
        pageNumber: 1,
        pageSize: 999,
        landlordSlugs: null,
        searchContent: null,
        searchFields: null,
        email: null,
        sortBy: accountSortByMapping.updatedAt,
        sortDirection: sortDirectionMapping.descend,
      },
      newParams,
    )),
    communicationType: actions.ACCOUNT_LANDLORD_LIST_CS,
    successAction: setLandlordList,
    onSuccess: (res) => {
      onSuccess(res);
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const getLandlordContactProperty = (params, onSuccess = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getGeneralUrl.url(),
    params: queries.getLandlordContactProperty(formatSimpleParams(
      {
        pageNumber: 1,
        pageSize: 1,
        email: null,
      },
      params,
    )),
    communicationType: actions.ACCOUNT_LANDLORD_PROPERTY_CS,
    onSuccess: (res) => {
      onSuccess(res);
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const createLandlordContact = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getGeneralUrl.url(),
    params: queries.createLandlordContact(formatSimpleParams(
      {
        email: null,
        firstName: null,
        landlordId: null,
        lastName: null,
        propertyIds: null,
      },
      params,
    )),
    communicationType: actions.LANDLORD_CREATE_CS,
    onError: () => {
      message.error(i18n.t('cms.landlord_account.create_error.tips'));
    },
    onSuccess: () => {
      message.success(i18n.t('cms.landlord_account.create_success.tips'));
      successCallback();
    },
  });
};

export const updateLandlordContact = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getGeneralUrl.url(),
    params: queries.updateLandlordContact(params),
    communicationType: actions.LANDLORD_UPDATE_CS,
    onError: () => {
      message.error(i18n.t('cms.landlord_account.update_error.tips'));
    },
    onSuccess: (res) => {
      message.success(i18n.t('cms.landlord_account.update_success.tips'));
      successCallback(res);
    },
  });
};
