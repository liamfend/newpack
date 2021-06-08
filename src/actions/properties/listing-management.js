/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { listingManagementActionType as actions } from '~constants/actionTypes';
import endpoints from '~settings/endpoints';
import { fetch } from '~actions/shared';
import * as queries from '~settings/queries';
import { message } from 'antd';
import i18n from '~settings/i18n';

export const setProperty = payload => ({
  type: actions.SET_PROPERTY,
  payload: payload.property,
});

export const getPropertyDetail = (slug, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getPropertyDetail.url(),
    params: queries.getPropertyDetail({ slug }),
    communicationType: actions.GET_PROPERTY_CS,
    successAction: setProperty,
    onSuccess: (res) => {
      successCallback(res);
    },
    onError: (e) => {
      if (e && e[0] && e[0].message === 'invalid node id.') {
        message.error(i18n.t('cms.properties.edit.toast.error.property_not_exist'));
      } else {
        message.error(i18n.t('cms.properties.edit.toast.error'));
      }
    },
  });
};

export const publishProperty = (
  params, successCallback = () => {}, errCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.publishProperty.url(),
    params: queries.publishProperty(params),
    communicationType: actions.PUBLISH_PROPERTY_CS,
    onSuccess: (data) => {
      const { status, error, description } = data.publishProperty;
      if (status === 'FAILED') {
        if (
          error === 'PROPERTY_CITY_UNPUBLISHED' ||
          error === 'PROPERTY_PENDING_DRAFT_EXISTS' ||
          error === 'PROPERTY_REJECTED_DRAFT_EXISTS'
        ) {
          message.error(i18n.t('cms.properties.edit.detail.city.state_invalid', {
            invalid: description,
          }));
        } else {
          message.error(i18n.t('cms.properties.edit.toast.error'));
        }
        return;
      }
      if (successCallback) { successCallback(); }
    },
    onError: (errors) => {
      if (
        params.publish && errors && errors[0] &&
        errors[0].message.indexOf('VALIDATE_PAYMENT_PLAN_FAIL') !== -1
      ) {
        errCallback();
      } else {
        message.error(i18n.t('cms.properties.edit.toast.error'));
      }
    },
  });
};

export const getPropertyPreview = (slug, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getGeneralUrl.url(),
    params: queries.getPropertyPreview({ slug }),
    communicationType: actions.GET_PROPERTY_PREVIEW_CS,
    onSuccess: (res) => {
      successCallback(res);
    },
    onError: (e) => {
      if (e && e[0] && e[0].message === 'invalid node id.') {
        message.error(i18n.t('cms.properties.edit.toast.error.property_not_exist'));
      } else {
        message.error(i18n.t('cms.properties.edit.toast.error'));
      }
    },
  });
};

export const deleteRoom = (id, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.deleteRoom.url(),
    params: queries.deleteRoom({ id }),
    communicationType: actions.DELETE_ROOM_CS,
    onSuccess: () => {
      successCallback();
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const createRoom = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.createRoom.url(),
    params: queries.createRoom(params),
    communicationType: actions.CREATE_ROOM_CS,
    onSuccess: (res) => {
      successCallback(res);
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const updateRoom = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.updateRoom(params),
    communicationType: actions.UPDATE_ROOM_CS,
    onSuccess: (res) => {
      successCallback(res);
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const setCopyRoomListing = params => ({
  type: actions.SET_COPY_ROOM_LISTING,
  payload: params,
});

export const createListing = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.createListing(params),
    communicationType: actions.CREATE_LISTING_CS,
    onSuccess: (res) => {
      successCallback(res);
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const updateListing = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.updateListing(params),
    communicationType: actions.UPDATE_LISTING_CS,
    onSuccess: successCallback,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const deleteListing = (id, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.deleteListing({ id }),
    communicationType: actions.DELETE_LISTING_CS,
    onSuccess: () => {
      successCallback();
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const bulkUpdateListings = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.bulkUpdateListings(params),
    communicationType: actions.BULK_UPDATE_LISTING_CS,
    onSuccess: () => {
      successCallback();
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const updateGallery = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.updateGallery(params),
    communicationType: actions.UPDATE_GALLERY_CS,
    onSuccess: (res) => {
      successCallback(res);
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};
