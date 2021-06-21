import { fetch, updateCommunicationStatus } from '~actions/shared'
import axios from 'axios'
import { message } from 'antd'
import cookies from 'js-cookie'
import i18n from '~settings/i18n'
import endpoints from '~settings/endpoints'
import * as queries from '~settings/queries'
import { formatSimpleParams } from '~helpers/params'
import { areaActionTypes as actions } from '~constants/actionTypes'
import { getItem } from '~base/global/helpers/storage'
import {
  sortDirectionMapping,
  areaSortByMapping,
  cookieNames,
  communicationStatus,
} from '~constants'

export const initialize = () => ({
  type: actions.INITIALIZE,
})

export const setAreaList = payload => ({
  type: actions.SET_LIST,
  payload: payload.areas,
})

export const getAreaList = params => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.getAreaList.url(),
    params: queries.areas(
      formatSimpleParams(
        {
          pageNumber: 1,
          pageSize: 10,
          slugs: null,
          citySlugs: null,
          sortBy: areaSortByMapping.updatedAt,
          sortDirection: sortDirectionMapping.descend,
        },
        params,
      ),
    ),
    communicationType: actions.LIST_CS,
    successAction: setAreaList,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'))
    },
  })
}

export const createArea = params => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.createArea.url(),
    params: queries.createArea(
      formatSimpleParams(
        {
          slug: null,
          name: null,
          published: false,
          cityNodeId: null,
        },
        params,
      ),
    ),
    communicationType: actions.CREATE_CS,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'))
    },
  })
}

export const setAreaDetail = payload => ({
  type: actions.SET_AREA_DETAIL,
  payload: payload.area,
})

export const setAreaBase = payload => ({
  type: actions.SET_AREA_BASE,
  payload: payload.area,
})

const onSaveSuccess = (successCallback, dispatch) => data => {
  if (data && data.updateArea.area && successCallback) {
    successCallback(data.updateArea.area)

    dispatch(setAreaDetail(data.updateArea))
    dispatch(setAreaBase(data.updateArea))
  }
}

export const updateArea = (params, successCallback, errorCallback) => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.updateArea.url(),
    params: queries.updateArea(params),
    communicationType: actions.UPDATE_CS,
    onSuccess: onSaveSuccess(successCallback, dispatch),
    onError: errorCallback,
  })
}

export const getAreaDetail = params => dispatch => {
  dispatch(
    updateCommunicationStatus({
      actionType: actions.GET_AREA_DETAIL_CS,
      status: communicationStatus.FETCHING,
    }),
  )
  const authorization = `Bearer ${cookies.get(cookieNames.token)}`
  const authPayload = getItem('PMS_CURRENT_USER_AUTH')
  const headers = {
    Authorization: authorization,
    'Accept-Language': 'en-us',
  }
  if (authPayload && authPayload.payload && authPayload.payload.currentRoleSlug) {
    headers['Current-Role'] = authPayload.payload.currentRoleSlug
  }
  axios({
    method: 'post',
    url: endpoints.getAreaDetail.url(),
    headers,
    data: queries.area(formatSimpleParams({ slug: '' }, params)),
  })
    .then(response => {
      if (typeof response.data.errors === 'undefined' && response.data.data) {
        dispatch(setAreaDetail(response.data.data))
        dispatch(setAreaBase(response.data.data))

        dispatch(
          updateCommunicationStatus({
            actionType: actions.GET_AREA_DETAIL_CS,
            status: communicationStatus.IDLE,
          }),
        )
      } else {
        dispatch(
          updateCommunicationStatus({
            actionType: actions.GET_AREA_DETAIL_CS,
            status: communicationStatus.ERROR,
            error: response.data.errors,
          }),
        )
      }
    })
    .catch(error => {
      dispatch(
        updateCommunicationStatus({
          actionType: actions.GET_AREA_DETAIL_CS,
          status: communicationStatus.ERROR,
          error,
        }),
      )
      message.error('Oooops, something went wrong')
    })
}

export const checkAreaExist = (slug, successCallback) => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.getAreaDetail.url(),
    params: queries.area({ slug }),
    communicationType: actions.CHECK_AREA_EXIST,
    onSuccess: data => {
      successCallback(data)
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'))
    },
  })
}
