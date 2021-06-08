import { message } from 'antd';
import i18n from '~settings/i18n';
import endpoints from '~settings/endpoints';
import { fetch, uploadFile } from '~actions/shared';
import * as queries from '~settings/queries';
import { propertyTermsActionTypes as actionTypes } from '~constants/actionTypes';
import { get } from 'lodash';
import { sortDirectionMapping, sortByMapping } from '~constants';

export const setPropertyTerms = data => ({
  type: actionTypes.SET_PROPERTY_TERMS,
  data,
});

export const getPropertyTerms = (propertySlug, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getPropertyTerms.url(),
    params: queries.getPropertyTerms({
      propertySlug,
      sortBy: sortByMapping.createdAt,
      sortDirection: sortDirectionMapping.descend,
    }),
    communicationType: actionTypes.GET_PROPERTY_TERMS,
    successAction: setPropertyTerms,
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

export const createPropertyTerms = (variables, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.createPropertyTerms.url(),
    params: queries.createPropertyTerms(variables),
    communicationType: actionTypes.CREATE_PROPERTY_TERMS,
    successAction: null,
    onSuccess: () => { successCallback(); },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const updatePropertyTerms = (variables, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.updatePropertyTerms.url(),
    params: queries.updatePropertyTerms(variables),
    communicationType: actionTypes.UPDATE_PROPERTY_TERMS,
    successAction: null,
    onSuccess: () => { successCallback(); },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const deletePropertyTerms = (variables, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.deletePropertyTerms.url(),
    params: queries.deletePropertyTerms(variables),
    communicationType: actionTypes.DELETE_PROPERTY_TERMS,
    successAction: null,
    onSuccess: () => { successCallback(); },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const uploadPropertyTermsFile = (
  selectedFile,
  successCallback,
  failedCallback,
  finallyCallback,
) => {
  uploadFile({
    endpoint: endpoints.uploadTermsFile.url(),
    query: queries.uploadPaymentsTermsAndConditionsFile,
    file: selectedFile,
    fileKey: 'variables.file',
  }).then((res) => {
    if (get(res, ['data', 'errors'])) {
      const errorMessage = get(res, ['data', 'errors', 0, 'message']);
      failedCallback({
        errorCode: errorMessage,
      });
    } else {
      const updateResultObj = get(res, ['data', 'data', 'uploadPaymentsTermsAndConditions']);
      successCallback(updateResultObj);
    }
  }).catch((err) => {
    failedCallback({
      errorCode: err.errorCode,
      errorDescription: err.errorMessage,
    });
  }).finally(finallyCallback);
};
