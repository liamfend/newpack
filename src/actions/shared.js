import { communicationStatus, cookieNames } from '~client/constants'
import axios from 'axios'
import cookies from 'js-cookie'
import { getItem } from '~base/global/helpers/storage'
/* eslint no-param-reassign: "off" */
export const isNetworkIssue = error =>
  error.message &&
  (error.message.indexOf('timeout') !== -1 || error.message.indexOf('Network') !== -1)

export const updateCommunicationStatus = ({ actionType, application, status, error = {} }) => ({
  type: actionType,
  application,
  status,
  error,
})

export const handleFetchCatch = ({ actionType, dispatch, application, error }) => {
  dispatch = dispatch || (m => m)
  if (isNetworkIssue(error)) {
    dispatch(
      updateCommunicationStatus({
        actionType,
        application,
        status: communicationStatus.TIMEOUT,
      }),
    )
  } else {
    dispatch(
      updateCommunicationStatus({
        actionType,
        application,
        status: communicationStatus.CLIENT_ERROR,
        error,
      }),
    )
  }
}

export const fetch = ({
  endpoint,
  params = {},
  communicationType,
  dispatch,
  successAction,
  errorAction,
  onSuccess,
  onError,
  onFinish,
  headers = {},
}) => {
  dispatch = dispatch || (m => m)
  dispatch(
    updateCommunicationStatus({
      actionType: communicationType,
      status: communicationStatus.FETCHING,
    }),
  )
  const authPayload = getItem('PMS_CURRENT_USER_AUTH')
  const headerConfig = {
    'Accept-Language': 'en-us',
    ...headers,
  }
  if (cookies.get(cookieNames.token)) {
    headerConfig.Authorization = `Bearer ${cookies.get(cookieNames.token)}`
  }
  if (authPayload && authPayload.payload && authPayload.payload.currentRoleSlug) {
    headerConfig['Current-Role'] = authPayload.payload.currentRoleSlug
  }

  axios({
    method: 'post',
    url: endpoint,
    data: params,
    headers: headerConfig,
  })
    .then(response => {
      if (typeof response.data.errors === 'undefined' && response.data.data) {
        if (successAction) {
          dispatch(successAction(response.data.data))
        }
        if (onSuccess) {
          onSuccess(response.data.data)
        }
        dispatch(
          updateCommunicationStatus({
            actionType: communicationType,
            status: communicationStatus.IDLE,
          }),
        )
      } else {
        dispatch(
          updateCommunicationStatus({
            actionType: communicationType,
            status: communicationStatus.ERROR,
            error: response.data.errors,
          }),
        )
        if (errorAction) {
          dispatch(errorAction(response.data.errors))
        }
        if (onError) {
          onError(response.data.errors)
        }
      }
    })
    .catch(error => {
      handleFetchCatch({
        actionType: communicationType,
        dispatch,
        error,
      })
      if (errorAction) {
        dispatch(errorAction(error))
      }
      if (onError) {
        onError(error)
      }
    })
    .finally(() => {
      if (typeof onFinish === 'function') {
        onFinish()
      }
    })
}

export const uploadFile = ({ endpoint, query, file, fileKey }) => {
  const operation = {
    query,
    variables: {
      input: {
        file: null,
      },
    },
  }
  // This map is used to associate the file saved in the body
  // of the request under "0" with the operation variable fileKey
  const map = {
    0: [fileKey],
  }
  // This is the body of the request
  // the FormData constructor builds a multipart/form-data request body
  // Here we add the operation, map, and file to upload
  const body = new FormData()
  body.append('operations', JSON.stringify(operation))
  body.append('map', JSON.stringify(map))
  body.append(0, file)

  const headers = {
    Authorization: `Bearer ${cookies.get(cookieNames.token)}`,
  }

  return axios.post(endpoint, body, { headers })
}
