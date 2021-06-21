import Immutable from 'immutable';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { countryActionTypes } from '~constants/actionTypes';

export const defaultState = Immutable.fromJS({
  list: {
    payload: [],
    total: 0,
  },
  communication: {
    list: defaultCommunicationObject,
  },

});

const formatPayload = countries =>
  countries.map(country => ({
    billingCycle: country.node.billingCycle,
    countryCode: country.node.countryCode,
    currencyCode: country.node.currencyCode,
    id: country.node.id,
    name: country.node.name,
    originalName: country.node.originalName,
    countrySlug: country.node.slug,
    publishedProperties: country.node.publishedProperties || 0,
    properties: country.node.properties || 0,
  }),
  );

const countryReducer = (state = defaultState, action) => {
  switch (action.type) {
    case countryActionTypes.INITIALIZE:
      return state;

    case countryActionTypes.SET_LIST: {
      const nextState = state.deleteIn(['list', 'payload']);
      return nextState.mergeDeep({
        list: {
          payload: formatPayload(action.payload.edges),
          total: action.payload.totalCount,
        },
      });
    }

    case countryActionTypes.LIST_CS:
      return state.mergeDeep({
        communication: {
          list: updateCommunicationObject(action.status, action.error),
        },
      });

    default:
      return state;
  }
};

export default countryReducer;
