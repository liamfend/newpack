import { fetch } from '~actions/shared';
import endpoints from '~settings/endpoints';
import * as queries from '~settings/queries';
import { sortDirectionMapping } from '~constants';
import { message } from 'antd';
import i18n from '~settings/i18n';
import { formatSimpleParams } from '~helpers/params';
import { reviewsTypes as actions } from '~constants/actionTypes';

export const setReviews = payload => ({
  type: actions.SET_LIST,
  payload: payload.reviews,
});

export const getReviews = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.getReviews(formatSimpleParams(
      {
        ratingMax: 5,
        ratingMin: 1,
        statuses: ['APPROVED'],
        updatedAtMax: null,
        updatedAtMin: null,
        pageNumber: 1,
        pageSize: 10,
        content: null,
        propertySlugs: null,
        sortBy: 'UPDATED_AT',
        sortDirection: sortDirectionMapping.descend,
      },
      params,
    )),
    communicationType: actions.LIST_CS,
    successAction: setReviews,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const deleteReview = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.deleteReview({ id: params }),
    communicationType: actions.DELETE_CS,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
    onSuccess: () => {
      message.success(i18n.t('cms.reviews.review.delete.success.tips'));
      successCallback();
    },
  });
};

export const rejectReview = (params, successCallback = () => {}, isUnpublish = false) =>
  (dispatch) => {
    fetch({
      dispatch,
      endpoint: endpoints.defaultUrl.url(),
      params: queries.rejectReview({ id: params }),
      communicationType: actions.REJECT_CS,
      onError: () => {
        message.error(i18n.t('cms.properties.edit.toast.error'));
      },
      onSuccess: () => {
        if (isUnpublish) {
          message.success(i18n.t('cms.reviews.review.unpublish.success.tips'));
        } else {
          message.success(i18n.t('cms.reviews.review.reject.success.tips'));
        }
        successCallback();
      },
    });
  };

export const approvalReview = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.approvalReview({ id: params }),
    communicationType: actions.APPROVAL_CS,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
    onSuccess: () => {
      message.success(i18n.t('cms.reviews.review.approval.success.tips'));
      successCallback();
    },
  });
};
