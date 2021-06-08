import { message } from 'antd';
import i18n from '~settings/i18n';
import { get } from 'lodash';
import { landlordActionTypes as actions } from '~constants/actionTypes';
import { fetch } from '~actions/shared';
import { sortDirectionMapping, sortByMapping } from '~constants';
import endpoints, { GRAPH_URL } from '~settings/endpoints';
import { formatSimpleParams } from '~helpers/params';
import { fetchAccountOwners } from '~actions/utilities';
import * as queries from '~settings/queries';
import landloadQueries, { listReconciliationPreference } from './queries';

const setLandlords = payload => ({
  type: actions.SET_LANDLORDS,
  payload: payload.landlords,
});

export const getLandlords = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getLandlords.url(),
    params: queries.getLandlords(formatSimpleParams(
      {
        billingCity: null,
        billingCountry: null,
        slugs: null,
        pageNumber: 1,
        pageSize: 10,
        sortBy: sortByMapping.createdAt,
        sortDirection: sortDirectionMapping.descend,
      },
      params,
    )),
    communicationType: actions.GET_LANDLORDS_CS,
    successAction: setLandlords,
    onError: () => {
      message.error(i18n.t('cms.landlord.modal.toast.error'));
    },
  });
};

export const searchLandlordList = (successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getLandlordList.url(),
    params: queries.searchLandlordList(
      {
        pageNumber: 1,
        pageSize: 9999,
      },
    ),
    communicationType: actions.LANDLORD_LIST_CS,
    onSuccess: (res) => {
      successCallback(res);
    },
  });
};

export const setCurrentLandlord = payload => ({
  type: actions.SET_CURRENT_LANDLORD,
  payload,
});

export const getLandlord = (slug, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getLandlord.url(),
    params: queries.getLandlord(slug),
    communicationType: actions.GET_LANDLORD_CS,
    onSuccess: (response) => {
      successCallback(response.landlord);
    },
    onError: () => {
      message.error(i18n.t('cms.landlord.modal.toast.error'));
    },
  });
};

export const setPreparedContract = payload => ({
  type: actions.SET_PREPARED_CONTRACT,
  payload,
});

export const createLandlord = (params, successCallback = () => {}) => (dispatch) => {
  const formatParams = formatSimpleParams(
    {
      billingAddress: null,
      billingCity: null,
      billingCountry: null,
      billingPostalCode: null,
      invoicingFrequency: null,
      isLongtail: false,
      name: null,
      systemProvider: null,
      systemProviderComment: null,
      purchaseOrderRequired: null,
      apCategory: null,
      bookingJourney: null,
      reconciliationPreference: null,
      reconciliationOption: null,
      reconciliationFrequency: null,
    },
    params,
  );

  if (
    formatParams.bookingJourney
    && formatParams.bookingJourney !== 'SEMI_AUTOMATIC'
  ) {
    formatParams.apCategory = null;
  }

  fetch({
    dispatch,
    endpoint: endpoints.createLandlord.url(),
    params: queries.createLandlord(formatParams),
    communicationType: actions.CREATE_LANDLORD_CS,
    onSuccess: () => {
      successCallback();
    },
    onError: () => {
      message.error(i18n.t('cms.landlord.modal.toast.error'));
    },
  });
};

export const updateLandlord = (params, successCallback = () => {}) => (dispatch) => {
  const formatParams = formatSimpleParams(
    {
      billingAddress: null,
      billingCity: null,
      billingCountry: null,
      billingPostalCode: null,
      invoicingFrequency: null,
      isLongtail: false,
      name: null,
      systemProvider: null,
      systemProviderComment: null,
      id: null,
      purchaseOrderRequired: null,
      apCategory: null,
      bookingJourney: null,
      bookingAutoConfirm: false,
      reconciliationPreference: null,
      reconciliationOption: null,
      reconciliationFrequency: null,
      accountManager: null,
    },
    params,
  );

  if (
    formatParams.bookingJourney
    && formatParams.bookingJourney !== 'SEMI_AUTOMATIC'
  ) {
    formatParams.apCategory = null;
  }

  fetch({
    dispatch,
    endpoint: endpoints.updateLandlord.url(),
    params: queries.updateLandlord(formatParams),
    communicationType: actions.UPDATE_LANDLORD_CS,
    onSuccess: (response) => {
      successCallback(response.updateLandlord);
    },
    onError: () => {
      message.error(i18n.t('cms.landlord.modal.toast.error'));
    },
  });
};

export const setPropertiesOfLandlord = payload => ({
  type: actions.SET_PROPERTIES_OF_LANDLORD,
  payload,
});

export const getPropertiesByLandlordSlug = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getPropertiesByLandlordSlug.url(),
    params: queries.getPropertiesByLandlordSlug(formatSimpleParams(
      {
        pageNumber: 1,
        pageSize: 10,
        citySlug: null,
        countrySlug: null,
        landlordSlug: null,
        statuses: null,
        slugs: null,
        bookNowEnable: null,
        countrySlugs: null,
      },
      params,
    )),
    communicationType: actions.GET_PROPERTIES_BY_LANDLORD_SLUG_CS,
    successAction: setPropertiesOfLandlord,
    onError: () => {
      message.error(i18n.t('cms.landlord.modal.toast.error'));
    },
  });
};

export const searchPropertyNameList = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.searchPropertyNameList.url(),
    params: queries.searchPropertyNameList(params),
    communicationType: actions.SEARCH_PROPERTY_NAME_LIST_CS,
    onSuccess: (res) => {
      successCallback(res);
    },
  });
};

export const getDisplayCountryList = (successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getDisplayCountryList.url(),
    params: queries.getDisplayCountryList(),
    communicationType: actions.GET_DISPLAY_COUNTRY_LIST_CS,
    onSuccess: (res) => {
      successCallback(res);
    },
  });
};

export const bindAutoConfirmSettings = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.bindAutoConfirmSettings(params),
    communicationType: actions.BIND_AUTO_CONFIRM_SETTINGS,
    onSuccess: (res) => {
      successCallback(res);
    },
    onError: () => {
      message.error(i18n.t('cms.landlord.modal.toast.error'));
    },
  });
};

export const getAccountOwners = (params, successCallback = () => {}) => (dispatch) => {
  fetchAccountOwners(actions, params, successCallback, dispatch);
};

export const getSystemProviderList = (successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: GRAPH_URL,
    params: landloadQueries,
    communicationType: actions.GET_SYSTEM_PROVIDER_LIST_CS,
    successAction: payload => ({
      type: actions.SET_SYSTEM_PROVIDER_LIST,
      payload: get(payload, ['__type', 'enumValues'], []).map(provider => provider.name),
    }),
    onSuccess: (res) => {
      successCallback(res);
    },
  });
};

export const getReconciliationPreferenceList = (successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: GRAPH_URL,
    params: listReconciliationPreference,
    communicationType: actions.GET_RECONCILIATION_PREFERENCE_LIST_CS,
    successAction: payload => ({
      type: actions.SET_RECONCILIATION_PREFERENCE_LIST,
      payload: get(payload, ['__type', 'enumValues'], []).map(preference => preference.name),
    }),
    onSuccess: (res) => {
      successCallback(res);
    },
  });
};
