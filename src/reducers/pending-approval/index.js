import Immutable from 'immutable';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { pendingApprovalActionTypes as actions } from '~constants/actionTypes';

export const defaultState = Immutable.fromJS({
  drafts: {
    payload: [],
    totalCount: 0,
    pendingCount: 0,
  },
  draft: {
    payload: null,
  },
  propertyComments: null,
  communication: {
    drafts: defaultCommunicationObject,
    update: defaultCommunicationObject,
    cancel: defaultCommunicationObject,
    pendingApprove: defaultCommunicationObject,
    save: defaultCommunicationObject,
    reject: defaultCommunicationObject,
    approval: defaultCommunicationObject,
    getComments: defaultCommunicationObject,
  },
});

const pendingApprovalReducer = (state = defaultState, action) => {
  switch (action.type) {
    case actions.SET_LIST: {
      const nextState = state.deleteIn(['drafts', 'payload']);
      return nextState.mergeDeep({
        drafts: {
          payload: action.payload.drafts,
          totalCount: action.payload.totalCount,
          pendingCount: action.payload.pendingCount,
        },
      });
    }

    case actions.LIST_CS:
      return state.mergeDeep({
        communication: {
          drafts: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.SET_DRAFT_DETAIL: {
      const nextState = state.deleteIn(['draft', 'payload']);
      return nextState.mergeDeep({
        draft: {
          payload: Object.assign(action.payload, { changes: JSON.parse(action.payload.changes) }),
        },
      });
    }

    case actions.GET_DRAFT_DETAIL_CS:
      return state.mergeDeep({
        communication: {
          draft: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.CANCEL_CS:
      return state.mergeDeep({
        communication: {
          cancel: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.PENDING_APPROVAL_PROPERTY_DRAFT_CS:
      return state.mergeDeep({
        communication: {
          pendingApprove: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.SAVE_PROPERTY_DRAFT_CS:
      return state.mergeDeep({
        communication: {
          save: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.REJECT_CS:
      return state.mergeDeep({
        communication: {
          reject: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.APPROVAL_CS:
      return state.mergeDeep({
        communication: {
          approval: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.GET_PROPERTY_COMMENTS_CS:
      return state.mergeDeep({
        communication: {
          getComments: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.SET_PROPERTY_COMMENTS:
      return state.mergeDeep({
        propertyComments: action.payload,
      });

    default:
      return state;
  }
};

export default pendingApprovalReducer;
