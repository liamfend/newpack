import Immutable from 'immutable';
import { propertyTermsActionTypes } from '~constants/actionTypes';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { get } from 'lodash';

export const defaultState = Immutable.fromJS({
  property: {},
  propertyTerms: [],
  communication: {
    get: defaultCommunicationObject,
  },
});

const termsReducer = (state = defaultState, action) => {
  switch (action.type) {
    case propertyTermsActionTypes.GET_PROPERTY_TERMS:
    case propertyTermsActionTypes.DELETE_PROPERTY_TERMS: {
      return state.mergeDeep({
        communication: {
          get: updateCommunicationObject(action.status, action.error),
        },
      });
    }

    case propertyTermsActionTypes.SET_PROPERTY_TERMS: {
      return state.merge({
        property: get(action.data, ['property'], {}),
        propertyTerms: get(action.data, ['property', 'paymentTermsAndConditions', 'edges'], []).map(item => item.node),
      });
    }

    default:
      return state;
  }
};

export default termsReducer;
