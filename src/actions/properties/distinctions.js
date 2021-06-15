import { distinctionsActionTypes as actions } from '~constants/actionTypes'
import endpoints from '~settings/endpoints'
import { fetch } from '~actions/shared'
import { sortDirectionMapping, sortByMapping } from '~constants'
import { formatSimpleParams } from '~helpers/params'
import * as queries from '~settings/queries'

export const initialize = () => ({
  type: actions.INITIALIZE,
})

export const setDistinctions = payload => ({
  type: actions.SET_LIST,
  unitTypes: payload.property.unitTypes.edges,
  property: {
    id: payload.property.id,
    name: payload.property.name,
    slug: payload.property.slug,
  },
})

export const getDistinctions = (propertySlug, params) => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.getDistinctions.url(),
    params: queries.distinctionsList(
      formatSimpleParams(
        {
          propertySlug: null,
          pageNumber: 1,
          pageSize: 10,
          sortBy: sortByMapping.updatedAt,
          sortDirection: sortDirectionMapping.descend,
          typeIds: [],
        },
        { propertySlug, ...params },
      ),
    ),
    communicationType: actions.LIST_CS,
    successAction: setDistinctions,
  })
}

export const createDistinction = params => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.createDistinction.url(),
    params: queries.createDistinction(
      formatSimpleParams(
        {
          propertyId: null,
          distinctionId: null,
          landlordValue: null,
        },
        params,
      ),
    ),
    communicationType: actions.CREATE_CS,
  })
}

export const updateDistinction = params => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.updateDistinction.url(),
    params: queries.updateDistinction(
      formatSimpleParams(
        {
          id: null,
          distinctionId: null,
          landlordValue: null,
        },
        params,
      ),
    ),
    communicationType: actions.UPDATE_CS,
  })
}

export const deleteDistinction = params => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.deleteDistinction.url(),
    params: queries.deleteDistinction(params),
    communicationType: actions.DELETE_CS,
  })
}

export const updateClassificationItem = data => ({
  type: actions.UPDATE_LIST_ITEM,
  distinction: data.addPropertyDistinctionToUnitType
    ? data.addPropertyDistinctionToUnitType.propertyDistinction
    : data.removePropertyDistinctionFromUnitType.propertyDistinction,
})

export const addPropertyDistinctionToUnitType = params => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.addDistinctionToUnitType.url(),
    params: queries.addPropertyDistinctionToUnitType(params),
    communicationType: actions.DISTINCTION_TO_UNIT_TYPE_CS,
    successAction: updateClassificationItem,
  })
}

export const removePropertyDistinctionFromUnitType = params => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.removeDistinctionFromUnitType.url(),
    params: queries.removePropertyDistinctionFromUnitType(params),
    communicationType: actions.DISTINCTION_TO_UNIT_TYPE_CS,
    successAction: updateClassificationItem,
  })
}
