import { fetch } from '~actions/shared'
import endpoints from '~settings/endpoints'
import * as queries from '~settings/queries'
import { imageActionTypes as actions } from '~constants/actionTypes'

export const updateLocationImage = (params, errorAction) => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.updateLocationImage.url(),
    params: queries.updateLocationImage(params),
    communicationType: actions.UPDATE_CS,
    onError: errorAction,
  })
}

export const createLocationImage = (params, errorAction) => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.createLocationImage.url(),
    params: queries.createLocationImage(params),
    communicationType: actions.CREATE_CS,
    onError: errorAction,
  })
}

export const deletedLocationImage = (params, errorAction) => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.deletedLocationImage.url(),
    params: queries.deletedLocationImage(params),
    communicationType: actions.DELETED_CS,
    onError: errorAction,
  })
}
