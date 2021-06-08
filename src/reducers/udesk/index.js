import Immutable from 'immutable';
import { udeskActionTypes } from '~constants/actionTypes';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';

export const defaultState = Immutable.fromJS({
  student: {},
  partner: {},
  communication: defaultCommunicationObject,
});

const udeskReducer = (state = defaultState, action) => {
  switch (action.type) {
    case udeskActionTypes.SET_STUDENT: {
      const nextState = state.delete('student');
      return nextState.mergeDeep({
        student: action.payload.getStudentDetails || {},
      });
    }

    case udeskActionTypes.SET_PARTNER: {
      const nextState = state.delete('partner');
      return nextState.mergeDeep({
        partner: action.payload || {},
      });
    }

    case udeskActionTypes.GET_STUDENT_CS:
      return state.mergeDeep({
        communication: updateCommunicationObject(action.status, action.error),
      });

    default:
      return state;
  }
};

export default udeskReducer;
