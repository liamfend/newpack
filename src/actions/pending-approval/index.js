import { message } from 'antd'
import i18n from '~settings/i18n'
import endpoints from '~settings/endpoints'
import * as queries from '~settings/queries'
import { fetch } from '~actions/shared'
import { pendingApprovalActionTypes as actions } from '~constants/actionTypes'
import {
  setEditedFields,
  setRoomsListings,
  updatePropertyPayload,
} from '~actions/properties/property-edit'
import {
  formatUpdateParam,
  mergePropertyAndDraft,
  mergeUnitTypes,
  getEditedFieldsValue,
  clearListingFakeId,
} from '~helpers/property-edit'
import { draftType } from '~constants'

export const setPendingApprovalList = payload => ({
  type: actions.SET_LIST,
  payload: payload.pendingApproveList,
})

export const getPendingApprovalList =
  (successCallback = () => {}, params) =>
  dispatch => {
    fetch({
      dispatch,
      endpoint: endpoints.defaultUrl.url(),
      params: queries.getPendingApprovalList(params),
      communicationType: actions.LIST_CS,
      successAction: setPendingApprovalList,
      onSuccess: () => {
        successCallback()
      },
      onError: () => {
        message.error(i18n.t('cms.properties.edit.toast.error'))
      },
    })
  }

export const setPendingApprovalDetails = payload => ({
  type: actions.SET_DRAFT_DETAIL,
  payload: payload.draft,
})

export const getPendingApprovalDetails = id => dispatch => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.getPendingApprovalDetails({ id }),
    communicationType: actions.GET_DRAFT_DETAIL_CS,
    successAction: setPendingApprovalDetails,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'))
    },
  })
}

export const pendingApprovePropertyDraft =
  (successCallback = () => {}) =>
  (dispatch, getState) => {
    const id = getState().dashboard.propertyEdit.getIn(['payload', 'id'])
    const landlordId = getState().dashboard.propertyEdit.getIn(['payload', 'landlord', 'id'])
    const editedFields = getState().dashboard.propertyEdit.get('editedFields').toJS()
    const params = {
      changes: JSON.stringify(editedFields),
      propertyId: id,
      landlordId,
    }

    fetch({
      dispatch,
      endpoint: endpoints.defaultUrl.url(),
      params: queries.pendingApprovePropertyDraft(params),
      communicationType: actions.PENDING_APPROVAL_PROPERTY_DRAFT_CS,
      onSuccess: () => {
        successCallback()
      },
      onError: () => {
        message.error(i18n.t('cms.properties.edit.toast.error'))
      },
    })
  }

export const savePropertyDraft =
  (successCallback = () => {}) =>
  (dispatch, getState) => {
    const id = getState().dashboard.propertyEdit.getIn(['payload', 'id'])
    const editedFields = getState().dashboard.propertyEdit.get('editedFields').toJS()
    const landlordId = getState().dashboard.propertyEdit.getIn(['payload', 'landlord', 'id'])
    const params = {
      changes: JSON.stringify(editedFields),
      propertyId: id,
      landlordId,
    }

    fetch({
      dispatch,
      endpoint: endpoints.defaultUrl.url(),
      params: queries.savePropertyDraft(params),
      communicationType: actions.SAVE_PROPERTY_DRAFT_CS,
      onSuccess: () => {
        successCallback()
      },
      onError: e => {
        if (e && e[0] && e[0].message && e[0].message.includes('PROPERTY_DRAFT_STATUS_ERROR')) {
          message.error(i18n.t('cms.properties.pending_approval.withdraw_pending.err'))
        } else {
          message.error(i18n.t('cms.properties.edit.toast.error'))
        }
      },
    })
  }

// processPropertyDraft
export const processPropertyDraft =
  (params, successCallback = () => {}) =>
  dispatch => {
    fetch({
      dispatch,
      endpoint: endpoints.defaultUrl.url(),
      params: queries.processPropertyDraft(params),
      communicationType: actions.PROCESS_PROPERTY_DRAFT_CS,
      onError: e => {
        if (e && e[0] && e[0].message) {
          if (e[0].message.includes('PROPERTY_DRAFT_STATUS_ERROR')) {
            message.error(i18n.t('cms.properties.pending_approval.no_draft.err'))
          } else if (e[0].message.includes('PROPERTY_DRAFT_NOT_FOUND')) {
            message.error(i18n.t('cms.properties.pending_approval.no_draft.err'))
          } else {
            message.error(i18n.t('cms.properties.edit.toast.error'))
          }
        } else {
          message.error(i18n.t('cms.properties.edit.toast.error'))
        }
      },
      onSuccess: () => {
        successCallback()
        message.success(i18n.t('cms.properties.pending_approval.modal.done_success'))
      },
    })
  }

export const cancelPropertyDraft =
  (successCallback = () => {}, id) =>
  dispatch => {
    fetch({
      dispatch,
      endpoint: endpoints.defaultUrl.url(),
      params: queries.cancelPropertyDraft(id),
      communicationType: actions.CANCEL_CS,
      onError: e => {
        if (e && e[0] && e[0].message) {
          if (e[0].message.includes('PROPERTY_DRAFT_EXIST')) {
            message.error(i18n.t('cms.properties.pending_approval.landlord_editing.err'))
          } else if (e[0].message.includes('PROPERTY_DRAFT_NOT_FOUND')) {
            message.error(i18n.t('cms.properties.pending_approval.no_draft.err'))
          } else {
            message.error(i18n.t('cms.properties.edit.toast.error'))
          }
        } else {
          message.error(i18n.t('cms.properties.edit.toast.error'))
        }
      },
      onSuccess: () => {
        successCallback()
      },
    })
  }

const setMergedDraftProperty = payload => ({
  type: actions.SET_MERGED_DRAFT_PROPERTY,
  payload,
})

export const initProperty = draft => (dispatch, getState) => {
  const property = getState().dashboard.propertyEdit.get('payload').toJS()
  const mergedDraftProperty = mergePropertyAndDraft(property, draft)

  const { rooms, virtualLinks, gallery } = draft
  const draftLinks = getEditedFieldsValue(virtualLinks)
  const draftGallery = getEditedFieldsValue(gallery)
  const updatedRoomsData = mergeUnitTypes(property.unitTypes, rooms, draftLinks, draftGallery, true)

  if (
    property.drafts &&
    property.drafts.edges.length !== 0 &&
    [draftType.EDITING, draftType.PENDING, draftType.REJECTED].indexOf(
      property.drafts.edges[0].node.status,
    ) !== -1
  ) {
    dispatch(setEditedFields(draft))
    dispatch(setMergedDraftProperty(mergedDraftProperty))
    dispatch(setRoomsListings(updatedRoomsData))
    dispatch(updatePropertyPayload(mergedDraftProperty.links))
  }
}

export const rejectPropertyDraft =
  (successCallback = () => {}, params) =>
  dispatch => {
    fetch({
      dispatch,
      endpoint: endpoints.defaultUrl.url(),
      params: queries.rejectPropertyDraft(params),
      communicationType: actions.REJECT_CS,
      onError: e => {
        if (e && e[0] && e[0].message) {
          if (e[0].message.includes('PROPERTY_DRAFT_STATUS_ERROR')) {
            message.error(i18n.t('cms.properties.pending_approval.cannot_reject.err'))
          } else if (e[0].message.includes('PROPERTY_DRAFT_NOT_FOUND')) {
            message.error(i18n.t('cms.properties.pending_approval.no_draft.err'))
          } else {
            message.error(i18n.t('cms.properties.edit.toast.error'))
          }
        } else {
          message.error(i18n.t('cms.properties.edit.toast.error'))
        }
      },
      onSuccess: () => {
        successCallback()
        message.success(i18n.t('cms.properties.pending_approval.modal.rejected_success'))
      },
    })
  }

export const approvalPropertyDraft =
  (successCallback = () => {}, params) =>
  (dispatch, getState) => {
    const editedFields = getState().dashboard.propertyEdit.get('editedFields').toJS()
    const property = getState().dashboard.propertyEdit.get('payload').toJS()
    const data = {
      propertyDraft: clearListingFakeId(formatUpdateParam(params.id, editedFields, property)),
      id: params.id,
      comments: params.comments,
    }

    fetch({
      dispatch,
      endpoint: endpoints.defaultUrl.url(),
      params: queries.approvalPropertyDraft(data),
      communicationType: actions.APPROVAL_CS,
      onError: e => {
        if (e && e[0] && e[0].message) {
          if (e[0].message.includes('ROPERTY_DRAFT_STATUS_ERROR')) {
            message.error(i18n.t('cms.properties.pending_approval.cannot_approved.err'))
          } else if (e[0].message.includes('PROPERTY_DRAFT_NOT_FOUND')) {
            message.error(i18n.t('cms.properties.pending_approval.no_draft.err'))
          } else {
            message.error(i18n.t('cms.properties.edit.toast.error'))
          }
        } else {
          message.error(i18n.t('cms.properties.edit.toast.error'))
        }
      },
      onSuccess: () => {
        successCallback()
        message.success(i18n.t('cms.properties.pending_approval.modal.approval_success'))
      },
    })
  }

export const setPropertyComments = payload => ({
  type: actions.SET_PROPERTY_COMMENTS,
  payload: payload.property,
})

export const getPropertyComments =
  (slug, successCallback = () => {}) =>
  dispatch => {
    fetch({
      dispatch,
      endpoint: endpoints.getPropertyComments.url(),
      params: queries.getPropertyComments({ slug }),
      communicationType: actions.GET_PROPERTY_COMMENTS_CS,
      successAction: setPropertyComments,
      onSuccess: res => {
        successCallback(res)
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

export const expirePropertyDraft =
  (draftIds, successCallback = () => {}) =>
  dispatch => {
    fetch({
      dispatch,
      endpoint: endpoints.expirePropertyDraft.url(),
      params: queries.expirePropertyDraft(draftIds),
      communicationType: actions.EXPIRE_PROPERTY_DRAFT_CS,
      onSuccess: res => {
        successCallback(res)
      },
      onError: () => {
        message.error(i18n.t('cms.properties.edit.toast.error'))
      },
    })
  }
