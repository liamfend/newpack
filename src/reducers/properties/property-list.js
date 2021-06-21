import Immutable from 'immutable';
import { get } from 'lodash';
import { propertyListActionTypes } from '~constants/actionTypes';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';

export const defaultState = Immutable.fromJS({
  list: {
    payload: [],
    total: 0,
  },
  communication: defaultCommunicationObject,
});

const formatPayload = properties => properties.map(property => ({
  name: get(property, 'node.name'),
  slug: get(property, 'node.slug'),
  countryName: get(property, 'node.city.country.name'),
  averageRating: get(property, 'node.reviewsSummary.averageRating'),
  cityName: get(property, 'node.city.name'),
  landlordName: get(property, 'node.landlord.name'),
  status: get(property, 'node.status'),
  updatedAt: get(property, 'node.updatedAt'),
  updatedBy: get(property, 'node.updatedByUser.name') || '',
  heroImage: get(property, 'node.heroImage') || {},
  state: get(property, 'node.state'),
}));

const propertyListReducer = (state = defaultState, action) => {
  switch (action.type) {
    case propertyListActionTypes.INITIALIZE:
      return state;

    case propertyListActionTypes.SET_LIST: {
      const nextState = state.deleteIn(['list', 'payload']);
      return nextState.mergeDeep({
        list: {
          payload: formatPayload(get(action, 'payload.edges')),
          total: action.payload.totalCount,
        },
      });
    }

    case propertyListActionTypes.LIST_CS:
      return state.mergeDeep({
        communication: updateCommunicationObject(action.status, action.error),
      });

    default:
      return state;
  }
};

export default propertyListReducer;
