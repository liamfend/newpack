/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { propertyEditActionType as actions, awsTokenActionType } from '~constants/actionTypes';
import endpoints from '~settings/endpoints';
import { fetch } from '~actions/shared';
import * as queries from '~settings/queries';
import { message } from 'antd';
import i18n from '~settings/i18n';
import { formatUpdateParam, hasUnsavedData, clearListingFakeId } from '~helpers/property-edit';
import { updateMutation } from '~client/constants';
import { isLandlordRole } from '~client/helpers/auth';

export const setProperty = payload => ({
  type: actions.SET_PROPERTY,
  payload: payload.property,
});

export const setRoomsListings = data => ({
  type: actions.SET_ROOMS_LISTINGS,
  data,
});

export const setRoomsDataChanged = data => ({
  type: actions.SET_ROOMS_DATA_CHANGED,
  data,
});

export const setListingsDataChanged = data => ({
  type: actions.SET_LISTINGS_DATA_CHANGED,
  data,
});

export const setBulkListingsDataChanged = data => ({
  type: actions.SET_BULK_LISTINGS_DATA_CHANGED,
  data,
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


export const setEditedFields = editedTab => ({
  type: actions.SET_EDITED_FIELDS,
  editedTab,
});

export const resetPropertyPayload = property => ({
  type: actions.RESET_PROPERTY,
  property,
});

export const resetMergedProperty = property => ({
  type: actions.RESET_MERGED_PROPERTY,
  property,
});

const onSaveSuccess = (dispatch, successCallback) => (data) => {
  if (data && data.updateProperty && data.updateProperty.property) {
    dispatch(resetPropertyPayload(data.updateProperty.property));
    if (successCallback) { successCallback(data.updateProperty.property); }
  }
};

export const updatePropertyPayload = links => ({
  type: actions.UPDATE_PROPERTY_PAYLOAD,
  links: links.map((link) => {
    const newLink = {
      ...link,
      _action: link.action,
    };
    delete newLink.action;
    return newLink;
  }),
});

export const saveProperty = (successCallback, communication = actions.SAVE_PROPERTY_CS) =>
  (dispatch, getState) => {
    const id = getState().dashboard.propertyEdit.getIn(['payload', 'id']);
    const editedFields = getState().dashboard.propertyEdit.get('editedFields').toJS();
    const rooms = getState().dashboard.propertyEdit.getIn(['cloneRoomListingData']).toJS();
    const property = getState().dashboard.propertyEdit.get('payload').toJS();
    const params = clearListingFakeId(formatUpdateParam(id, editedFields, property));

    if (hasUnsavedData(editedFields, rooms)) {
      fetch({
        dispatch,
        endpoint: endpoints.updateProperty.url(),
        params: queries.updateProperty(params),
        communicationType: communication,
        onSuccess: onSaveSuccess(dispatch, successCallback),
        onError: (e) => {
          if (
            e && e[0] && e[0].message
            && e[0].message.includes('PROPERTY_DRAFT_EXIST')
          ) {
            message.error(i18n.t('cms.properties.pending_approval.landlord_editing.err'));
          } else {
            message.error(i18n.t('cms.properties.edit.toast.error'));
          }
        },
      });
    } else {
      successCallback();
    }
  };


export const publishProperty = (isPublish, successCallback) => (dispatch, getState) => {
  const id = getState().dashboard.propertyEdit.getIn(['payload', 'id']);
  fetch({
    dispatch,
    endpoint: endpoints.publishProperty.url(),
    params: queries.publishProperty({ id, publish: isPublish }),
    communicationType: actions.PUBLISH_PROPERTY_CS,
    onSuccess: (data) => {
      const { status, error, description } = data.publishProperty;
      if (status === 'FAILED') {
        if (error === 'PROPERTY_CITY_UNPUBLISHED') {
          message.error(i18n.t('cms.properties.edit.detail.city.state_invalid', {
            invalid: description,
          }));
        } else {
          message.error(i18n.t('cms.properties.edit.toast.error'));
        }
        return;
      }
      dispatch({ type: actions.RESET_PROPERTY_STATUS });
      if (successCallback) { successCallback(); }
    },
    onError: () => { message.error(i18n.t('cms.properties.edit.toast.error')); },
  });
};

export const saveAndPublishProperty = (isPublish, successCallback) => (dispatch, getState) => {
  const editedFields = getState().dashboard.propertyEdit.getIn(['editedFields']).toJS();
  const rooms = getState().dashboard.propertyEdit.getIn(['cloneRoomListingData']).toJS();
  if (hasUnsavedData(editedFields, rooms)) {
    dispatch(saveProperty(() => {
      dispatch(publishProperty(isPublish, successCallback));
    }, actions.PUBLISH_PROPERTY_CS));
  } else {
    dispatch(publishProperty(isPublish, successCallback));
  }
};

const getEditedRooms = cloneRooms => cloneRooms
  .filter(item => item.node.action && item.node.action !== updateMutation.NEW)
  .map((room) => {
    const roomType = room.node.roomType || 'SQM';
    const returnObj = {
      id: room.node.id,
      name: room.node.name,
      category: room.node.category,
      roomSize: room.node.roomSize || null,
      roomType: room.node.roomSize ? roomType : null,
      floors: room.node.floors ? room.node.floors : [],
      viewType: room.node.viewType,
      bedCount: room.node.bedCount,
      bedSizeType: room.node.bedSizeType,
      maxOccupancy: room.node.maxOccupancy,
      dualOccupancy: room.node.dualOccupancy ? room.node.dualOccupancy : null,
      bathroomType: room.node.bathroomType,
      kitchenArrangement: room.node.kitchenArrangement,
      lastFurnished: room.node.lastFurnished,
      roomArrangement: room.node.roomArrangement,
      bedroomCountMin: room.node.bedroomCountMin,
      bedroomCountMax: room.node.bedroomCountMax,
      bathroomCount: room.node.bathroomCount,
      kitchenCount: room.node.kitchenCount,
      genderMix: room.node.genderMix,
      dietaryPreference: room.node.dietaryPreference,
      smokingPreference: room.node.smokingPreference,
      links: room.node.links && room.node.links.reduce((result, item) => {
        if (item.action) {
          const newLink = {
            ...item,
            _action: item.action,
          };
          if (/fake_id/g.test(newLink.id)) {
            delete newLink.id;
          }
          delete newLink.action;
          result.push(newLink);
        }

        return result;
      }, []),
      unitTypeBedSizes: room.node.unitTypeBedSizes && room.node.unitTypeBedSizes
        .reduce((result, item) => {
          if (item.action) {
            const newItem = {
              type: item.type === 'NOT_SPECIFIC' ? null : item.type,
              length: item.length,
              width: item.width,
              bedCount: item.bedCount,
              _action: item.action,
            };
            if (!String(item.id).includes('fake-id')) {
              newItem.id = item.id;
            }

            result.push(newItem);
          }

          return result;
        }, []),
      facilities: room.node.facilities
        && room.node.facilities.reduce((result, facility) => {
          if (facility.action) {
            facility._action = facility.action;
            delete facility.action;
            result.push(facility);
          } else if (facility._action) {
            result.push(facility);
          }

          return result;
        }, []),
      listings: !room.node.listings ? [] : room.node.listings.filter(
        listing => listing.action,
      ).map((listing) => {
        const listingData = {
          moveInType: listing.moveInType,
          moveIn: listing.moveIn,
          tenancyLengthType: listing.tenancyLengthType,
          tenancyLengthValue: listing.tenancyLengthValue,
          moveOutType: listing.moveOutType,
          moveOut: listing.moveOut,
          type: listing.type,
          availability: listing.availability,
          priceMin: listing.priceMin,
          liveOn: listing.liveOn,
          liveUntil: listing.liveUntil,
          autoPriceAllowed: listing.autoPriceAllowed,
          autoAvailAllowed: listing.autoAvailAllowed,
          _action: listing.action,
        };

        if (isLandlordRole()) {
          listingData.id = listing.id;
        }

        if (!isLandlordRole() && listing.action && listing.action !== updateMutation.INSERT) {
          listingData.id = listing.id;
        }

        if (listing.discountType !== 'NO_DISCOUNT' && listing.discountType !== null) {
          listingData.discountType = listing.discountType;
          listingData.discountValue = listing.discountValue ?
            listing.discountValue.toString() : null;
        } else {
          listingData.discountType = null;
          listingData.discountValue = null;
        }

        if (listing.priceMax) {
          listingData.priceMax = listing.priceMax;
        } else {
          listingData.priceMax = null;
        }
        return listingData;
      }),
      _action: room.node.action,
      isChangedByLink: room.node.isChangedByLink,
    };
    if (room.node.action === updateMutation.INSERT) {
      return returnObj;
    }
    return Object.assign({ id: room.node.id }, returnObj);
  });

export const updateRoom = (roomId, record, action) => (dispatch, getState) => {
  const roomsData = getState().dashboard.propertyEdit.get('cloneRoomListingData').toJS();
  let updatedRoomsData = [];
  // eslint-disable-next-line no-param-reassign
  switch (action) {
    case updateMutation.DELETE: {
      if (record.action === updateMutation.INSERT || record.action === updateMutation.NEW) {
        updatedRoomsData = roomsData.filter(room => room.node.id !== roomId);
      } else {
        updatedRoomsData = roomsData.map((room) => {
          if (room.node.id === roomId) {
            record.listings.map((listing) => {
              listing.action = action;
              return true;
            });
            record.links.map((link) => {
              link.action = action;
              return true;
            });
            if ('isChangedByLink' in record) {
              delete record.isChangedByLink;
            }
            return { node: { ...record, action } };
          }
          return room;
        });
      }
      break;
    }
    case updateMutation.INSERT: {
      const targetRoom = roomsData.find(room => room.node.id === roomId);
      if (targetRoom) {
        updatedRoomsData = roomsData.map((room) => {
          if (room.node.id === roomId) {
            return { node: { ...record, action } };
          }
          return room;
        });
      } else {
        roomsData.unshift({ node: { ...record, action } });
        updatedRoomsData = roomsData;
      }
      break;
    }
    case updateMutation.NEW: {
      roomsData.unshift({ node: { ...record, action } });
      updatedRoomsData = roomsData;
      break;
    }
    default: { // UPDATE
      updatedRoomsData = roomsData.map((room) => {
        if (room.node.id === roomId) {
          if ((room.node.action && room.node.action === updateMutation.INSERT)) {
            return { node: { ...record, action: updateMutation.INSERT } };
          }

          return { node: { ...record, action } };
        }
        return room;
      });
      break;
    }
  }
  dispatch(setRoomsListings(updatedRoomsData));
  dispatch(setEditedFields({ rooms: getEditedRooms(updatedRoomsData) }));
};

export const updatePropertyListing = (
  roomId,
  listingId,
  record,
) => (dispatch, getState) => {
  const roomsData = getState().dashboard.propertyEdit.get('cloneRoomListingData').toJS();
  let targetListingIndex;
  let targetRoomIndex;

  roomsData.find((room, index) => {
    if (room.node.id === roomId) {
      if (listingId) {
        const targetListing = room.node.listings.find(listing => listing.id === listingId);
        targetListingIndex = room.node.listings.indexOf(targetListing);
      }
      targetRoomIndex = index;
    }
    return room.node.id === roomId;
  });

  if (typeof targetRoomIndex !== 'undefined' && record) {
    const data = record;
    if (typeof targetListingIndex !== 'undefined' && targetListingIndex !== -1) {
      roomsData[targetRoomIndex].node.listings[targetListingIndex] = data;
    } else {
      if (!roomsData[targetRoomIndex].node.listings) {
        roomsData[targetRoomIndex].node.listings = [];
      }

      roomsData[targetRoomIndex].node.listings.push(data);
    }
  }

  // delete record by listing id
  if (!record && typeof targetRoomIndex !== 'undefined' && typeof targetListingIndex !== 'undefined') {
    roomsData[targetRoomIndex].node.listings.splice(targetListingIndex, 1);
  }

  if (typeof targetListingIndex !== 'undefined') {
    roomsData[targetRoomIndex].node.action =
      roomsData[targetRoomIndex].node.action || updateMutation.UPDATE;
  }

  if (
    !record &&
    listingId.startsWith('fake-id-') &&
    roomsData[targetRoomIndex] &&
    Array.isArray(roomsData[targetRoomIndex].node.listings) &&
    roomsData[targetRoomIndex].node.listings.every(listing => !listing.action)
  ) {
    delete roomsData[targetRoomIndex].node.action;
  }

  dispatch(setRoomsListings(roomsData));
  dispatch(setEditedFields({ rooms: getEditedRooms(roomsData) }));
};

export const getUploadVideoToken = successCallback => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getUploadVideoToken.url(),
    params: queries.getUploadVideoToken(),
    communicationType: awsTokenActionType.GET_UPLOAD_VIDEO_TOKEN,
    onSuccess: (data) => {
      successCallback(data);
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const checkVideoUploaded = (videoHash, successCallback) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.checkVideoUploaded.url(),
    params: queries.checkVideoUploaded({ videoHash }),
    communicationType: awsTokenActionType.CHECK_VIDEO_UPLOADED,
    onSuccess: (data) => {
      successCallback(data);
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const createVideo = (param, successCallback) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.createVideo.url(),
    params: queries.createVideo(param),
    communicationType: awsTokenActionType.CREATE_VIDEO,
    onSuccess: (data) => {
      successCallback(data);
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};
