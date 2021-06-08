import Immutable from 'immutable';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { imageActionTypes } from '~constants/actionTypes';

export const defaultState = Immutable.fromJS({
  communication: {
    update: defaultCommunicationObject,
  },
});

const imageReducer = (state = defaultState, action) => {
  switch (action.type) {
    case imageActionTypes.UPDATE_CS:
      return state.mergeDeep({
        communication: {
          update: updateCommunicationObject(action.status, action.error),
        },
      });

    default:
      return state;
  }
};

export default imageReducer;
