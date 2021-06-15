import {
  offerMapActionTypes as actions,
  offerListActionTypes as offerListActions,
} from '~constants/actionTypes'
import { fetch } from '~actions/shared'
import endpoints from '~settings/endpoints'
import * as queries from '~settings/queries'

export const initialize = () => ({
  type: actions.INITIALIZE,
})

export const setPropertyList = payload => ({
  type: actions.SET_LIST,
  payload: payload.search,
})

export const setLandlordPropertyList = payload => ({
  type: actions.SET_LIST,
  payload: payload.viewer.company.properties,
})

export const setLinkOperatingOffer = payload => ({
  type: offerListActions.SET_OPERATING_OFFER,
  payload: payload.linkSpecialOffer.specialOffer,
})

export const setUnlinkOperatingOffer = payload => ({
  type: offerListActions.SET_OPERATING_OFFER,
  payload: payload.unLinkSpecialOffer.specialOffer,
})

export const linkSpecialOffer = params => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.getSpecialOfferList.url(),
    params: queries.linkSpecialOffer(params),
    communicationType: actions.LINK_CS,
    successAction: setLinkOperatingOffer,
  })
}

export const unLinkSpecialOffer = params => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.getSpecialOfferList.url(),
    params: queries.unLinkSpecialOffer(params),
    communicationType: actions.UNLINK_CS,
    successAction: setUnlinkOperatingOffer,
  })
}

export const searchProperties = value => dispatch => {
  const query = queries.searchProperties({
    pageNumber: 1,
    pageSize: 20,
    query: value,
  })

  fetch({
    dispatch,
    endpoint: endpoints.getSpecialOfferList.url(),
    params: query,
    communicationType: actions.LIST_CS,
    successAction: setPropertyList,
  })
}
