import { fetch, updateCommunicationStatus } from '~actions/shared';
import axios from 'axios';
import { message } from 'antd';
import cookies from 'js-cookie';
import i18n from '~settings/i18n';
import endpoints from '~settings/endpoints';
import * as queries from '~settings/queries';
import { formatSimpleParams } from '~helpers/params';
import { cityActionTypes as actions } from '~constants/actionTypes';
import { getItem } from '~base/global/helpers/storage';
import {
  sortDirectionMapping,
  citySortByMapping,
  cookieNames,
  communicationStatus,
} from '~constants';

export const setCityDetail = payload => ({
  type: actions.SET_CITY_DETAIL,
  payload: payload.city,
});

export const setCityBase = payload => ({
  type: actions.SET_CITY_BASE,
  payload: payload.city,
});

export const getCityDetail = params => (dispatch) => {
  dispatch(
    updateCommunicationStatus({
      actionType: actions.GET_CITY_DETAIL_CS,
      status: communicationStatus.FETCHING,
    }),
  );

  const authorization = `Bearer ${cookies.get(cookieNames.token)}`;
  const headers = {
    Authorization: authorization,
    'Accept-Language': 'en-us',
  };
  const authPayload = getItem('PMS_CURRENT_USER_AUTH');

  if (authPayload && authPayload.payload && authPayload.payload.currentRoleSlug) {
    headers['Current-Role'] = authPayload.payload.currentRoleSlug;
  }

  axios({
    method: 'post',
    url: endpoints.getCityDetail.url(),
    headers,
    data: queries.city(formatSimpleParams(
      { slug: '' },
      params,
    )),
  }).then((response) => {
    if (typeof response.data.errors === 'undefined' && response.data.data) {
      dispatch(setCityDetail(response.data.data));
      dispatch(setCityBase(response.data.data));

      dispatch(
        updateCommunicationStatus({
          actionType: actions.GET_CITY_DETAIL_CS,
          status: communicationStatus.IDLE,
        }),
      );
    } else {
      dispatch(
        updateCommunicationStatus({
          actionType: actions.GET_CITY_DETAIL_CS,
          status: communicationStatus.ERROR,
          error: response.data.errors,
        }),
      );
    }
  })
    .catch((error) => {
      dispatch(
        updateCommunicationStatus({
          actionType: actions.GET_CITY_DETAIL_CS,
          status: communicationStatus.ERROR,
          error,
        }),
      );
      message.error('Oooops, something went wrong');
    });
};

export const initialize = () => ({
  type: actions.INITIALIZE,
});

export const setCityList = payload => ({
  type: actions.SET_LIST,
  payload: payload.cities,
});

export const getCityList = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getCityList.url(),
    params: queries.cities(formatSimpleParams(
      {
        pageNumber: 1,
        pageSize: 10,
        slugs: null,
        countrySlugs: null,
        sortBy: citySortByMapping.updatedAt,
        sortDirection: sortDirectionMapping.descend,
      },
      params,
    )),
    communicationType: actions.LIST_CS,
    successAction: setCityList,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const createCity = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.createCity.url(),
    params: queries.createCity(formatSimpleParams(
      {
        slug: null,
        name: null,
        longitude: null,
        latitude: null,
        published: false,
        countryId: null,
      },
      params,
    )),
    communicationType: actions.CREATE_CS,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

const onSaveSuccess = (successCallback, dispatch) => (data) => {
  if (data && data.updateCity.city && successCallback) {
    successCallback(data.updateCity.city);

    dispatch(setCityDetail(data.updateCity));
    dispatch(setCityBase(data.updateCity));
  }
};

export const updateCity = (params, successCallback, errorCallback) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.updateCity.url(),
    params: queries.updateCity(params),
    communicationType: actions.UPDATE_CS,
    onSuccess: onSaveSuccess(successCallback, dispatch),
    onError: errorCallback,
  });
};

export const checkCityExist = (slug, successCallback) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getCityDetail.url(),
    params: queries.city({ slug }),
    communicationType: actions.CHECK_CITY_EXIST,
    onSuccess: (data) => {
      successCallback(data);
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};
