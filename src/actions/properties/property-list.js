import { propertyListActionTypes as actions } from '~constants/actionTypes';
import { fetch } from '~actions/shared';
import { sortDirectionMapping, sortByMapping } from '~constants';
import endpoints from '~settings/endpoints';
import { formatSimpleParams } from '~helpers/params';
import * as queries from '~settings/queries';
import { isLandlordRole } from '~helpers/auth';

export const initialize = () => ({
  type: actions.INITIALIZE,
});

export const setPropertyList = payload => ({
  type: actions.SET_LIST,
  payload: payload.properties,
});

export const getPropertyList = (
  params, successCallback = () => {},
) => (dispatch) => {
  const propertyParams = params;

  if (isLandlordRole()) {
    if (
      (!params.statuses)
      || (params.statuses && params.statuses.indexOf('NEW') !== -1)
    ) {
      propertyParams.statuses = ['EDITING', 'PUBLISHED', 'UNPUBLISHED'];
    }
  }
  const sort = params.sort && params.sort.toUpperCase();
  fetch({
    dispatch,
    endpoint: endpoints.getPropertyList.url(),
    params: queries.properties(formatSimpleParams(
      {
        pageNumber: 1,
        pageSize: 10,
        sortBy: sort,
        sortDirection: sort === sortByMapping.NAME
          ? sortDirectionMapping.ascend : sortDirectionMapping.descend,
        countrySlug: null,
        citySlug: null,
        landlordSlug: null,
        statuses: null,
        fullName: null,
        propertyType: null,
      },
      propertyParams,
    )),
    communicationType: actions.LIST_CS,
    successAction: setPropertyList,
    onSuccess: successCallback,
  });
};

export const createProperty = (
  params,
  successCallback = () => {},
  failedCallback = () => {},
) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.createProperty.url(),
    params: queries.createProperty(formatSimpleParams(
      {
        name: null,
        latitude: 0,
        longitude: 0,
        address: null,
        country: null,
        cityId: null,
        currency: null,
        postalCode: null,
        landlordId: null,
        propertyType: null,
        shippingCity: null,
      },
      params,
    )),
    communicationType: actions.CREATE_PROPERTY_CS,
    onSuccess: successCallback,
    onError: failedCallback,
  });
};

export const updatePropertyNote = (
  params,
  successCallback = () => {},
  failedCallback = () => {},
) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.updateProperty.url(),
    params: queries.updatePropertyContractStage(params),
    communicationType: actions.UPDATE_PROPERTY_RECORD_NOTE_CS,
    onSuccess: successCallback,
    onError: failedCallback,
  });
};

export const editPropertyNote = (
  params,
  successCallback = () => {},
  failedCallback = () => {},
) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.recordModal.url(),
    params: queries.updatePropertyContractNote(params),
    communicationType: actions.EDIT_PROPERTY_RECORD_NOTE_CS,
    onSuccess: successCallback,
    onError: failedCallback,
  });
};

export const deletePropertyNote = (
  params,
  successCallback = () => {},
  failedCallback = () => {},
) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.recordModal.url(),
    params: queries.deletePropertyContractNote(params),
    communicationType: actions.DELETE_PROPERTY_RECORD_NOTE_CS,
    onSuccess: successCallback,
    onError: failedCallback,
  });
};
