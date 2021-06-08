import Immutable from 'immutable';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { depositActionTypes } from '~constants/actionTypes';

export const defaultState = Immutable.fromJS({
  communication: {
    create: defaultCommunicationObject,
    update: defaultCommunicationObject,
    delete: defaultCommunicationObject,
    updatePropertyPaymentsEnable: defaultCommunicationObject,
    getPropertyDeposite: defaultCommunicationObject,
  },
  propertyDeposite: {},
});

const depositReducer = (state = defaultState, action) => {
  switch (action.type) {
    case depositActionTypes.CREATE_CS:
      return state.mergeDeep({
        communication: {
          create: updateCommunicationObject(action.status, action.error),
        },
      });

    case depositActionTypes.GET_PROPERTY_DEPOSIT_CS:
      return state.mergeDeep({
        communication: {
          getPropertyDeposite: updateCommunicationObject(action.status, action.error),
        },
      });

    case depositActionTypes.SET_PROPERTY_DEPOSIT_CS:
      return state.set('propertyDeposite', action.data.property);

    case depositActionTypes.UPDATE_CS:
      return state.mergeDeep({
        communication: {
          update: updateCommunicationObject(action.status, action.error),
        },
      });

    case depositActionTypes.UPDATE_PROPERTY_CS:
      return state.mergeDeep({
        communication: {
          updatePropertyPaymentsEnable: updateCommunicationObject(action.status, action.error),
        },
      });

    case depositActionTypes.DELETE_CS:
      return state.mergeDeep({
        communication: {
          delete: updateCommunicationObject(action.status, action.error),
        },
      });

    default:
      return state;
  }
};

export default depositReducer;
