import axios from 'axios'
import { fetch, updateCommunicationStatus } from '~actions/shared'
import { message } from 'antd'
import cookies from 'js-cookie'
import i18n from '~settings/i18n'
import { universityActionTypes as actions } from '~constants/actionTypes'
import endpoints from '~settings/endpoints'
import * as queries from '~settings/queries'
import { formatSimpleParams } from '~helpers/params'
import { getItem } from '~base/global/helpers/storage'
import {
  sortDirectionMapping,
  universitySortByMapping,
  cookieNames,
  communicationStatus,
} from '~constants'

export const initialize = () => ({
  type: actions.INITIALIZE,
})

export const setUniversityList = payload => ({
  type: actions.SET_LIST,
  payload: payload.universities,
})

export const getUniversityList = params => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.getUniversityList.url(),
    params: queries.universities(
      formatSimpleParams(
        {
          pageNumber: 1,
          pageSize: 10,
          slugs: null,
          citySlugs: null,
          sortBy: universitySortByMapping.updatedAt,
          sortDirection: sortDirectionMapping.descend,
        },
        params,
      ),
    ),
    communicationType: actions.LIST_CS,
    successAction: setUniversityList,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'))
    },
  })
}

export const setUniversityDetail = payload => ({
  type: actions.SET_UNIVERSITY_DETAIL,
  payload: payload.university,
})

export const setUniversityBase = payload => ({
  type: actions.SET_UNIVERSITY_BASE,
  payload: payload.university,
})

export const getUniversityDetail = params => dispatch => {
  dispatch(
    updateCommunicationStatus({
      actionType: actions.GET_UNIVERSITY_DETAIL_CS,
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
    url: endpoints.getUniversityDetail.url(),
    headers,
    data: queries.university(
      formatSimpleParams(
        {
          slug: '',
        },
        params,
      ),
    ),
  })
    .then(response => {
      if (typeof response.data.errors === 'undefined' && response.data.data) {
        dispatch(setUniversityBase(response.data.data))
        dispatch(setUniversityDetail(response.data.data))

        dispatch(
          updateCommunicationStatus({
            actionType: actions.GET_UNIVERSITY_DETAIL_CS,
            status: communicationStatus.IDLE,
          }),
        )
      } else {
        dispatch(
          updateCommunicationStatus({
            actionType: actions.GET_UNIVERSITY_DETAIL_CS,
            status: communicationStatus.ERROR,
            error: response.data.errors,
          }),
        )
      }
    })
    .catch(error => {
      dispatch(
        updateCommunicationStatus({
          actionType: actions.GET_UNIVERSITY_DETAIL_CS,
          status: communicationStatus.ERROR,
          error,
        }),
      )
      message.error('Oooops, something went wrong')
    })
}

export const createUniversity = params => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.createUniversity.url(),
    params: queries.createUniversity(
      formatSimpleParams(
        {
          slug: null,
          name: null,
          published: false,
          cityId: null,
          countryId: null,
          address: null,
          zipCode: null,
          longitude: null,
          latitude: null,
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

const onSaveSuccess = (successCallback, dispatch) => data => {
  if (data && data.updateUniversity.university && successCallback) {
    successCallback(data.updateUniversity.university)

    dispatch(setUniversityDetail(data.updateUniversity))
    dispatch(setUniversityBase(data.updateUniversity))
  }
}

export const updateUniversity = (params, successCallback, errorCallback) => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.updateUniversity.url(),
    params: queries.updateUniversity(params),
    communicationType: actions.UPDATE_CS,
    onSuccess: onSaveSuccess(successCallback, dispatch),
    onError: errorCallback,
  })
}

export const checkUniversityExist = (slug, successCallback) => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.getUniversityDetail.url(),
    params: queries.university({ slug }),
    communicationType: actions.CHECK_UNIVERSITY_EXIST,
    onSuccess: data => {
      successCallback(data)
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'))
    },
  })
}
