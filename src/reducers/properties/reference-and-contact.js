import Immutable from 'immutable';
import { get } from 'lodash';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { landlordInfoActionTypes } from '~constants/actionTypes';
import { formatAccountOwners } from '~helpers/account-owner';

export const defaultState = Immutable.fromJS({
  payload: {},
  accountOwners: [],
  communication: {
    get: defaultCommunicationObject,
    getAccountOwners: defaultCommunicationObject,
  },
});

const referenceAndContactReducer = (state = defaultState, action) => {
  switch (action.type) {
    case landlordInfoActionTypes.SET_INFO:
      return state.set('payload', get(action, 'data.property', {}));

    case landlordInfoActionTypes.GET_CS:
      return state.mergeDeep({
        communication: {
          get: updateCommunicationObject(action.status, action.error),
        },
      });

    case landlordInfoActionTypes.SET_ACCOUNT_OWNERS:
      return state.mergeDeep({
        accountOwners: formatAccountOwners(action.data),
      });

    case landlordInfoActionTypes.GET_ACCOUNT_OWNER_CS:
      return state.mergeDeep({
        communication: {
          getAccountOwners: updateCommunicationObject(action.status, action.error),
        },
      });

    default:
      return state;
  }
};

export default referenceAndContactReducer;
