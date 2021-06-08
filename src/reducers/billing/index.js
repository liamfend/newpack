import Immutable from 'immutable';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { billingActionTypes } from '~constants/actionTypes';

export const defaultState = Immutable.fromJS({
  transferList: {
    payload: [],
    total: 0,
  },
  transferDetails: {},
  receiveList: {
    payload: [],
    total: 0,
  },
  receiveDetails: {},
  refundList: {
    payload: [],
    total: 0,
  },
  refundDetails: {},
  communication: {
    transferList: defaultCommunicationObject,
    transferDetails: defaultCommunicationObject,
    receiveList: defaultCommunicationObject,
    receiveDetails: defaultCommunicationObject,
    updateOrderTransferred: defaultCommunicationObject,
    updateOrderReceivable: defaultCommunicationObject,
    refundList: defaultCommunicationObject,
    refundDetails: defaultCommunicationObject,
  },
});

const billingReducer = (state = defaultState, action) => {
  switch (action.type) {
    case billingActionTypes.SET_LIST_ORDER_TRANSFER: {
      const nextState = state.deleteIn(['transferList', 'payload']);
      return nextState.mergeDeep({
        transferList: {
          payload: action.payload.listOrderTransfers ? action.payload.listOrderTransfers.edges : [],
          total: action.payload.listOrderTransfers ?
            action.payload.listOrderTransfers.totalCount : 0,
        },
      });
    }

    case billingActionTypes.GET_LIST_ORDER_TRANSFER_CS:
      return state.mergeDeep({
        communication: {
          transferList: updateCommunicationObject(action.status, action.error),
        },
      });

    case billingActionTypes.SET_ORDER_TRANSFER: {
      const nextState = state.deleteIn(['transferDetails']);
      return nextState.mergeDeep({
        transferDetails: action.payload && action.payload.edges && action.payload.edges[0] ?
          action.payload.edges[0].node : {},
      });
    }

    case billingActionTypes.GET_ORDER_TRANSFER:
      return state.mergeDeep({
        communication: {
          transferDetails: updateCommunicationObject(action.status, action.error),
        },
      });

    case billingActionTypes.SET_LIST_ORDER_RECEIVE: {
      const nextState = state.deleteIn(['receiveList', 'payload']);
      return nextState.mergeDeep({
        receiveList: {
          payload: action.payload.listOrderReceivables.edges,
          total: action.payload.listOrderReceivables.totalCount,
        },
      });
    }

    case billingActionTypes.GET_LIST_ORDER_RECEIVE_CS:
      return state.mergeDeep({
        communication: {
          receiveList: updateCommunicationObject(action.status, action.error),
        },
      });

    case billingActionTypes.SET_ORDER_RECEIVE: {
      const nextState = state.deleteIn(['receiveDetails']);
      return nextState.mergeDeep({
        receiveDetails:
          action.payload && action.payload.edges && action.payload.edges[0] ?
            action.payload.edges[0].node : {},
      });
    }

    case billingActionTypes.GET_ORDER_RECEIVE:
      return state.mergeDeep({
        communication: {
          receiveDetails: updateCommunicationObject(action.status, action.error),
        },
      });

    case billingActionTypes.UPDATE_ORDER_TRANSFERRED_CS:
      return state.mergeDeep({
        communication: {
          updateOrderTransferred: updateCommunicationObject(action.status, action.error),
        },
      });

    case billingActionTypes.UPDATE_ORDER_RECEIVABLE_CS:
      return state.mergeDeep({
        communication: {
          updateOrderReceivable: updateCommunicationObject(action.status, action.error),
        },
      });

    case billingActionTypes.SET_LIST_ORDER_REFUND: {
      const nextState = state.deleteIn(['refundList', 'payload']);
      return nextState.mergeDeep({
        refundList: {
          payload: action.payload.listOrderRefunds ? action.payload.listOrderRefunds.edges : [],
          total: action.payload.listOrderRefunds ?
            action.payload.listOrderRefunds.totalCount : 0,
        },
      });
    }

    case billingActionTypes.GET_LIST_ORDER_REFUND_CS:
      return state.mergeDeep({
        communication: {
          refundList: updateCommunicationObject(action.status, action.error),
        },
      });

    case billingActionTypes.SET_ORDER_REFUND: {
      const nextState = state.deleteIn(['refundDetails']);
      return nextState.mergeDeep({
        refundDetails:
          action.payload && action.payload.edges && action.payload.edges[0] ?
            action.payload.edges[0].node : {},
      });
    }

    case billingActionTypes.GET_ORDER_REFUND:
      return state.mergeDeep({
        communication: {
          refundDetails: updateCommunicationObject(action.status, action.error),
        },
      });

    default:
      return state;
  }
};

export default billingReducer;
