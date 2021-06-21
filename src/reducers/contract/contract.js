import Immutable from 'immutable';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { contractActionTypes } from '~constants/actionTypes';

export const defaultState = Immutable.fromJS({
  list: {
    payload: [],
    total: 0,
  },
  listCommunication: defaultCommunicationObject,
  landlord: [],
  propertyContract: {},
});

const formatPayload = contracts =>
  contracts.map(contract => ({
    id: contract.node.id,
    createdAt: contract.node.createdAt,
    effectiveFrom: contract.node.effectiveFrom,
    landlord: contract.node.landlord,
    status: contract.node.status,
    updatedAt: contract.node.updatedAt,
    properties: contract.node.properties || [],
    files: contract.node.files || [],
    effectiveTo: contract.node.effectiveTo,
    signedDate: contract.node.signedDate,
  }),
  );

const contractReducer = (state = defaultState, action) => {
  switch (action.type) {
    case contractActionTypes.SET_CONTRACT_LIST: {
      const nextState = state.deleteIn(['list', 'payload']);
      return nextState.mergeDeep({
        list: {
          payload: formatPayload(action.payload.edges),
          total: action.payload.totalCount,
        },
      });
    }
    case contractActionTypes.GET_CONTRACT_LIST_CS: {
      return state.mergeDeep({
        listCommunication: updateCommunicationObject(action.status, action.error),
      });
    }

    case contractActionTypes.SET_LANDLORD_LIST: {
      return state.mergeDeep({
        landlord: action.data.search.edges,
      });
    }

    default:
      return state;
  }
};

export default contractReducer;
