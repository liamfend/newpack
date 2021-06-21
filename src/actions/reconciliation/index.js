import { reconciliationActionTypes as actions } from '~constants/actionTypes'
import { fetch } from '~actions/shared'
import moment from 'moment'
import { get, compact } from 'lodash'
import endpoints from '~settings/endpoints'
import { formatSimpleParams } from '~helpers/params'
import * as queries from '~settings/queries'
import { message } from 'antd'
import { sortByMapping } from '~constants'
import i18n from '~settings/i18n'
import * as reconciliationQueries from './queries'

export const setListReconciliationLandlords = payload => ({
  type: actions.SET_LIST_RECONCILIATION_LANDLORDS,
  payload,
})

export const listReconciliationLandlords = params => dispatch => {
  const newParam = { ...params }
  if (
    newParam.completedAtStart &&
    moment(newParam.completedAtStart).isBefore(moment().subtract(1, 'year').startOf('year'))
  ) {
    newParam.completedAtStart = moment().startOf('year').format('YYYY-MM-DDTHH:mm:ssZ')
  }

  if (
    newParam.completedAtEnd &&
    moment(newParam.completedAtEnd).isBefore(moment().subtract(1, 'year').startOf('year'))
  ) {
    newParam.completedAtEnd = moment().endOf('month').format('YYYY-MM-DDTHH:mm:ssZ')
  }

  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.listReconciliationLandlords(
      formatSimpleParams(
        {
          pageNumber: 1,
          pageSize: 10,
          completedAtEnd: moment().endOf('month').format('YYYY-MM-DDTHH:mm:ssZ'),
          completedAtStart: moment().startOf('year').format('YYYY-MM-DDTHH:mm:ssZ'),
          orderReferenceId: null,
          landlordIds: null,
          billingCountry: [],
          reconciliationOption: null,
        },
        newParam,
      ),
    ),
    communicationType: actions.GET_LIST_RECONCILIATION_LANDLORDS_CS,
    successAction: setListReconciliationLandlords,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'))
    },
  })
}

export const getReconciliationBulkUpdateRecords = params => dispatch => {
  const newParam = { ...params }
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: reconciliationQueries.listReconciliationBulkUpdateRecords(
      formatSimpleParams(
        {
          pageNumber: 1,
          pageSize: 10,
          originalFilename: null,
          status: null,
          updatedByUuids: null,
          sortBy: sortByMapping.createdAt,
        },
        newParam,
      ),
    ),
    communicationType: actions.GET_LIST_RECONCILIATION_BULK_UPDATE_RECORDS_CS,
    successAction: payload => ({
      type: actions.SET_LIST_RECONCILIATION_BULK_UPDATE_RECORDS,
      data: {
        payload: get(payload, ['listReconciliationBulkUpdateRecords', 'edges']).map(record => {
          const bulkUpdateRecord = record.node
          const fullName = []

          const firstName = get(bulkUpdateRecord, ['cmsUser', 'firstName'], '')
          const lastName = get(bulkUpdateRecord, ['cmsUser', 'lastName'], '')
          fullName.push(firstName)
          fullName.push(lastName)
          bulkUpdateRecord.cmsUser = compact(fullName).join(' ')

          return bulkUpdateRecord
        }),
        total: get(payload, ['listReconciliationBulkUpdateRecords', 'totalCount']),
      },
    }),
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'))
    },
  })
}
