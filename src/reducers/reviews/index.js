import Immutable from 'immutable';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { reviewsTypes } from '~constants/actionTypes';

export const defaultState = Immutable.fromJS({
  list: {
    payload: [],
    total: 0,
    approvedStatusCount: 0,
    newStatusCount: 0,
    rejectedStatusCount: 0,
  },
  communication: {
    list: defaultCommunicationObject,
    delete: defaultCommunicationObject,
    reject: defaultCommunicationObject,
    approval: defaultCommunicationObject,
  },
});

const formatPayload = reviews =>
  reviews.map(review => ({
    content: review.node.content,
    createdAt: review.node.createdAt,
    headline: review.node.headline,
    id: review.node.id,
    location: review.node.location,
    nickname: review.node.nickname,
    property: review.node.property,
    rating: review.node.rating,
    ratingFacility: review.node.ratingFacility,
    ratingLocation: review.node.ratingLocation,
    ratingSafety: review.node.ratingSafety,
    ratingStaff: review.node.ratingStaff,
    ratingTransport: review.node.ratingTransport,
    ratingValue: review.node.ratingValue,
    status: review.node.status,
    tags: review.node.tags,
    university: review.node.university,
    updatedAt: review.node.updatedAt,
    propertyImages: review.node.propertyImages,
    unitTypeImages: review.node.unitTypeImages,
  }),
  );

const reviewReducer = (state = defaultState, action) => {
  switch (action.type) {
    case reviewsTypes.SET_LIST: {
      const nextState = state.deleteIn(['list', 'payload']);
      return nextState.mergeDeep({
        list: {
          payload: formatPayload(action.payload.edges),
          total: action.payload.totalCount,
          approvedStatusCount: action.payload.approvedStatusCount,
          newStatusCount: action.payload.newStatusCount,
          rejectedStatusCount: action.payload.rejectedStatusCount,
        },
      });
    }

    case reviewsTypes.LIST_CS:
      return state.mergeDeep({
        communication: {
          list: updateCommunicationObject(action.status, action.error),
        },
      });

    case reviewsTypes.DELETE_CS:
      return state.mergeDeep({
        communication: {
          delete: updateCommunicationObject(action.status, action.error),
        },
      });

    case reviewsTypes.REJECT_CS:
      return state.mergeDeep({
        communication: {
          reject: updateCommunicationObject(action.status, action.error),
        },
      });

    case reviewsTypes.APPROVAL_CS:
      return state.mergeDeep({
        communication: {
          approval: updateCommunicationObject(action.status, action.error),
        },
      });

    default:
      return state;
  }
};

export default reviewReducer;
