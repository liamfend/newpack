import Immutable from 'immutable';
import { recordActionTypes } from '~constants/actionTypes';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';

export const defaultState = Immutable.fromJS({
  propertyNote: {},
  communication: {
    propertyNote: defaultCommunicationObject,
  },
});

const recordReducer = (state = defaultState, action) => {
  switch (action.type) {
    case recordActionTypes.GET_PROPERTY_NOTE_CS: {
      return state.mergeDeep({
        communication: {
          propertyNote: updateCommunicationObject(action.status, action.error),
        },
      });
    }

    case recordActionTypes.SET_PROPERTY_NOTE_CS: {
      return state.set('propertyNote', action.data);
    }

    default:
      return state;
  }
};

export default recordReducer;
