import i18n from '~settings/i18n';
import { message } from 'antd';
import { countryActionTypes as actions } from '~constants/actionTypes';
import { fetch } from '~actions/shared';
import endpoints from '~settings/endpoints';
import { formatSimpleParams } from '~helpers/params';
import * as queries from '~settings/queries';
import { sortDirectionMapping, countrySortByMapping } from '~constants';

export const initialize = () => ({
  type: actions.INITIALIZE,
});

export const setCountryList = payload => ({
  type: actions.SET_LIST,
  payload: payload.countries,
});

export const getCountryList = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getCountryList.url(),
    params: queries.countries(formatSimpleParams(
      {
        pageNumber: 1,
        pageSize: 10,
        billingCycle: null,
        countrySlugs: null,
        sortBy: countrySortByMapping.updatedAt,
        sortDirection: sortDirectionMapping.descend,
      },
      params,
    )),
    communicationType: actions.LIST_CS,
    successAction: setCountryList,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const getNoPropertiescountriesList = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getCountryList.url(),
    params: queries.noPropertiescountries(formatSimpleParams(
      {
        pageNumber: 1,
        pageSize: 999,
        sortBy: countrySortByMapping.updatedAt,
        sortDirection: sortDirectionMapping.descend,
      },
      params,
    )),
    communicationType: actions.LIST_CS,
    successAction: setCountryList,
  });
};
