import Immutable from 'immutable';
import { mergeWithoutList } from '~helpers/index';
import { listingManagementActionType as actions } from '~constants/actionTypes';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';

export const defaultState = Immutable.fromJS({
  payload: null,
  copiedRoomListings: [],
  communication: {
    getDetail: defaultCommunicationObject,
    publish: defaultCommunicationObject,
    getPropertyReview: defaultCommunicationObject,
    createRoom: defaultCommunicationObject,
    updateRoom: defaultCommunicationObject,
    deleteRoom: defaultCommunicationObject,
    createListing: defaultCommunicationObject,
    updateListing: defaultCommunicationObject,
    deleteListing: defaultCommunicationObject,
    bulkUpdateListings: defaultCommunicationObject,
    updateGallery: defaultCommunicationObject,
  },
});

const listingManagementReducer = (state = defaultState, action) => {
  switch (action.type) {
    case actions.GET_PROPERTY_CS:
      return state.mergeDeep({
        communication: {
          getDetail: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.SET_PROPERTY:
      return mergeWithoutList(state, {
        payload: action.payload,
      });

    case actions.PUBLISH_PROPERTY_CS:
      return state.mergeDeep({
        communication: {
          publish: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.GET_PROPERTY_PREVIEW_CS:
      return state.mergeDeep({
        communication: {
          getPropertyReview: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.CREATE_ROOM_CS:
      return state.mergeDeep({
        communication: {
          createRoom: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.UPDATE_ROOM_CS:
      return state.mergeDeep({
        communication: {
          updateRoom: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.DELETE_ROOM_CS:
      return state.mergeDeep({
        communication: {
          deleteRoom: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.SET_COPY_ROOM_LISTING: {
      const nextState = state.deleteIn(['copiedRoomListings']);
      return nextState.mergeDeep({
        copiedRoomListings: action.payload,
      });
    }

    case actions.CREATE_LISTING_CS:
      return state.mergeDeep({
        communication: {
          createListing: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.UPDATE_LISTING_CS:
      return state.mergeDeep({
        communication: {
          updateListing: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.DELETE_LISTING_CS:
      return state.mergeDeep({
        communication: {
          deleteListing: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.BULK_UPDATE_LISTING_CS:
      return state.mergeDeep({
        communication: {
          bulkUpdateListings: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.UPDATE_GALLERY_CS:
      return state.mergeDeep({
        communication: {
          updateGallery: updateCommunicationObject(action.status, action.error),
        },
      });

    default:
      return state;
  }
};

export default listingManagementReducer;
