import { offerListActionTypes as actions } from '~constants/actionTypes';
import { fetch } from '~actions/shared';
import { sortDirectionMapping, sortByMapping } from '~constants';
import endpoints from '~settings/endpoints';
import { formatSimpleParams } from '~helpers/params';
import * as queries from '~settings/queries';

export const initialize = () => ({
  type: actions.INITIALIZE,
});

export const setOfferList = payload => ({
  type: actions.SET_LIST,
  payload: payload.specialOffers,
});

export const operatingOffer = payload => ({
  type: actions.SET_OPERATING_OFFER,
  payload,
});

export const setEditoperatingOffer = payload => ({
  type: actions.SET_OPERATING_OFFER,
  payload: payload.node,
});

export const setOperatingOffer = payload => ({
  type: actions.SET_OPERATING_OFFER,
  payload: payload.createSpecialOffer.specialOffer,
});

export const setUpdateOperatingOffer = payload => ({
  type: actions.SET_OPERATING_OFFER,
  payload: payload.updateSpecialOffer.specialOffer,
});

export const setLandlordOfferList = payload => ({
  type: actions.SET_LIST,
  payload: payload.viewer.company.specialOffers,
});

export const getOfferList = params => (dispatch) => {
  const simpleParams = formatSimpleParams(
    {
      pageNumber: 1,
      pageSize: 10,
      sortBy: sortByMapping.updatedAt,
      sortDirection: sortDirectionMapping.descend,
      internalTitle: null,
      propertyId: null,
      cityId: null,
      landlordId: null,
      universityId: null,
      title: null,
      offerType: null,
      ownerType: null,
      minTenancyValue: null,
      tenancyUnit: null,
    },
    params,
  );
  const query = queries.specialOfferList(simpleParams);

  fetch({
    dispatch,
    endpoint: endpoints.getSpecialOfferList.url(),
    params: query,
    communicationType: actions.LIST_CS,
    successAction: setOfferList,
  });
};

export const getOperatingOffer = id => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getSpecialOfferList.url(),
    params: queries.getSpecialOffer({
      id,
    }),
    communicationType: actions.LIST_CS,
    successAction: setEditoperatingOffer,
  });
};

export const createSpecialOffer = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getSpecialOfferList.url(),
    params: queries.createSpecialOffer(params),
    communicationType: actions.CREATE_CS,
    successAction: setOperatingOffer,
  });
};

export const deleteOffer = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.deleteSpecialOffer.url(),
    params: queries.deleteSpecialOffer(params),
    communicationType: actions.DELETE_CS,
  });
};

export const updateSpecialOffer = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getSpecialOfferList.url(),
    params: queries.updateSpecialOffer(params),
    communicationType: actions.UPDATE_CS,
    successAction: setUpdateOperatingOffer,
  });
};
