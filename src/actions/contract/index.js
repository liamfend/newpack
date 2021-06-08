import { fetch } from '~actions/shared';
import { message } from 'antd';
import i18n from '~settings/i18n';
import endpoints from '~settings/endpoints';
import * as queries from '~settings/queries';
import { formatSimpleParams } from '~helpers/params';
import { contractActionTypes as actions } from '~constants/actionTypes';

export const setContractList = payload => ({
  type: actions.SET_CONTRACT_LIST,
  payload: payload.contracts,
});

export const setLandlordList = data => ({
  type: actions.SET_LANDLORD_LIST,
  data,
});

export const getContractList = (params, onSuccess = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getContractList.url(),
    params: queries.getContractList(formatSimpleParams(
      {
        pageNumber: 1,
        pageSize: 10,
        signedDateStart: null,
        signedDateEnd: null,
        landlordSlugs: null,
        statuses: null,
        sortBy: 'UPDATED_AT',
        sortDirection: 'DESCENDING',
      },
      params,
    )),
    communicationType: actions.GET_CONTRACT_LIST_CS,
    successAction: setContractList,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
    onSuccess: (res) => {
      onSuccess(res);
    },
  });
};

export const createContract = (params, callback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.createContract.url(),
    params: queries.createContract(params),
    communicationType: actions.CREATE_CONTRACT_CS,
    successAction: getContractList,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
    onSuccess(response) {
      callback(response);
    },
  });
};


export const updateContract = (params, callback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.updateContract.url(),
    params: queries.updateContract(params),
    communicationType: actions.UPDATE_CONTRACT_CS,
    successAction: getContractList,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
    onSuccess(response) {
      callback(response);
    },
  });
};

export const deleteContract = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.deleteContract.url(),
    params: queries.deleteContract(params),
    communicationType: actions.DELETE_CONTRACT_CS,
    successAction: getContractList,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const bulkDuallySigned = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.bulkDuallySigned.url(),
    params: queries.bulkDuallySigned(params),
    communicationType: actions.BULK_DUALLY_SIGNED_PROPERTY,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const searchLandlordList = value => (dispatch) => {
  const query = queries.searchLandlordList(
    {
      pageNumber: 1,
      pageSize: 9999,
      query: value,
    },
  );
  fetch({
    dispatch,
    endpoint: endpoints.getSpecialOfferList.url(),
    params: query,
    communicationType: actions.LANDLORD_LIST_CS,
    successAction: setLandlordList,
  });
};

export const queryLandlord = (params, onSuccess) => (dispatch) => {
  const query = queries.queryLandlord({
    slug: params,
  });
  fetch({
    dispatch,
    endpoint: endpoints.getContractList.url(),
    params: query,
    communicationType: actions.LANDLORD_SELECTED_CS,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
    onSuccess: (res) => {
      onSuccess(res);
    },
  });
};
