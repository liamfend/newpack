import { message } from 'antd';
import i18n from '~settings/i18n';
import endpoints from '~settings/endpoints';
import { fetch } from '~actions/shared';
import * as queries from '~settings/queries';
import { landlordInfoActionTypes as actionTypes } from '~constants/actionTypes';
import { fetchAccountOwners } from '~actions/utilities';

export const setReferenceAndContact = data => ({
  type: actionTypes.SET_INFO,
  data,
});

export const getReferenceAndContact = (slug, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getReferenceAndContact.url(),
    params: queries.getReferenceAndContact({ slug }),
    communicationType: actionTypes.GET_CS,
    successAction: setReferenceAndContact,
    onSuccess: () => { successCallback(); },
    onError: (e) => {
      if (e && e[0] && e[0].message === 'invalid node id.') {
        message.error(i18n.t('cms.properties.edit.toast.error.property_not_exist'));
      } else {
        message.error(i18n.t('cms.properties.edit.toast.error'));
      }
    },
  });
};

export const getAccountOwners = (params, successCallback = () => {}) => (dispatch) => {
  fetchAccountOwners(actionTypes, params, successCallback, dispatch);
};
