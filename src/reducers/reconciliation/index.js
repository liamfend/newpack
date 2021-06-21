import Immutable from 'immutable';
import { get } from 'lodash';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { reconciliationActionTypes } from '~constants/actionTypes';
import * as actionTypes from '~actions/reconciliation/actionTypes';

export const defaultState = Immutable.fromJS({
  reconciliationLandlordsList: {
    payload: [],
    totalCount: 0,
  },
  list: {
    payload: [],
    total: 0,
  },
  landlord: [],
  bulkHistory: {
    payload: [],
    total: 0,
  },
  communication: {
    reconciliationLandlordsList: defaultCommunicationObject,
    list: defaultCommunicationObject,
    landlord: defaultCommunicationObject,
    bulkHistory: defaultCommunicationObject,
  },
});

const reconciliationReducer = (state = defaultState, action) => {
  switch (action.type) {
    case actionTypes.SET_RECONCILIATION_OPPORTUNITY_LIST: {
      const nextState = state.deleteIn(['list', 'payload']);
      return nextState.mergeDeep({
        list: {
          payload: get(action, 'payload.listLandlordReconciliationOpportunities.edges', []),
          total: get(action, 'payload.listLandlordReconciliationOpportunities.totalCount', 0),
        },
      });
    }
    case actionTypes.GET_RECONCILIATION_OPPORTUNITY_LIST:
      return state.mergeDeep({
        communication: {
          list: updateCommunicationObject(action.status, action.error),
        },
      });

    case reconciliationActionTypes.SET_LIST_RECONCILIATION_LANDLORDS: {
      const nextState = state.deleteIn(['reconciliationLandlordsList', 'payload']);
      return nextState.mergeDeep({
        reconciliationLandlordsList: {
          payload: action.payload.listReconciliationLandlords ?
            action.payload.listReconciliationLandlords.edges : [],
          totalCount: action.payload.listReconciliationLandlords ?
            action.payload.listReconciliationLandlords.totalCount : 0,
        },
      });
    }

    case reconciliationActionTypes.GET_LIST_RECONCILIATION_LANDLORDS_CS: {
      return state.mergeDeep({
        communication: {
          reconciliationLandlordsList: updateCommunicationObject(action.status, action.error),
        },
      });
    }

    case reconciliationActionTypes.SET_LIST_RECONCILIATION_BULK_UPDATE_RECORDS:
      return state.deleteIn(['bulkHistory']).mergeDeep({
        bulkHistory: action.data,
      });

    case reconciliationActionTypes.GET_LIST_RECONCILIATION_BULK_UPDATE_RECORDS_CS:
      return state.mergeDeep({
        communication: {
          bulkHistory: updateCommunicationObject(action.status, action.error),
        },
      });
    default:
      return state;
  }
};

export default reconciliationReducer;
