import { recordActionTypes as actions } from '~constants/actionTypes'
import endpoints from '~settings/endpoints'
import { fetch } from '~actions/shared'
import * as queries from '~settings/queries'
import { message } from 'antd'
import i18n from '~settings/i18n'

export const setPropertyNote = data => ({
  type: actions.SET_PROPERTY_NOTE_CS,
  data: data.property,
})

export const getPropertyNote =
  (slug, onSuccess = () => {}) =>
  dispatch => {
    fetch({
      dispatch,
      endpoint: endpoints.getGeneralUrl.url(),
      params: queries.getPropertyNote({ slug }),
      communicationType: actions.GET_PROPERTY_NOTE_CS,
      successAction: setPropertyNote,
      onSuccess: res => {
        onSuccess(res)
      },
      onError: e => {
        if (e && e[0] && e[0].message === 'invalid node id.') {
          message.error(i18n.t('cms.properties.edit.toast.error.property_not_exist'))
        } else {
          message.error(i18n.t('cms.properties.edit.toast.error'))
        }
      },
    })
  }
