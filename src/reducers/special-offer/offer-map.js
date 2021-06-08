import Immutable from 'immutable';
import { offerMapActionTypes } from '~constants/actionTypes';
import {
  defaultCommunicationObject,
  updateCommunicationObject,
} from '~reducers/shared';

export const defaultState = Immutable.fromJS({
  list: {
    payload: [],
    total: 0,
  },
  propertyList: {
    payload: [],
    total: 0,
  },
  communication: {
    list: defaultCommunicationObject,
    link: defaultCommunicationObject,
    unlink: defaultCommunicationObject,
    create: defaultCommunicationObject,
    update: defaultCommunicationObject,
    delete: defaultCommunicationObject,
  },
});
const formatUnitTypes = types =>
  types.edges.map(type => ({
    id: type.node.id,
    name: type.node.name,
    listings: type.node.listings,
  }));

const formatProperties = properties =>
  properties.map(property => ({
    name: property.node.name,
    slug: property.node.slug,
    city: property.node.city,
    id: property.node.id,
    unitTypes: formatUnitTypes(property.node.unitTypes),
  }));

const SpecialOffersListReducer = (state = defaultState, action) => {
  switch (action.type) {
    case offerMapActionTypes.INITIALIZE:
      return state;

    case offerMapActionTypes.SET_LIST: {
      const nextState = state.deleteIn(['list', 'payload']);
      return nextState.mergeDeep({
        list: {
          payload: formatProperties(action.payload.edges),
          total: action.payload.totalCount,
        },
      });
    }

    case offerMapActionTypes.LIST_CS:
      return state.mergeDeep({
        communication: {
          list: updateCommunicationObject(action.status, action.error),
        },
      });

    case offerMapActionTypes.LINK_CS:
      return state.mergeDeep({
        communication: {
          link: updateCommunicationObject(action.status, action.error),
        },
      });

    case offerMapActionTypes.UNLINK_CS:
      return state.mergeDeep({
        communication: {
          unlink: updateCommunicationObject(action.status, action.error),
        },
      });


    default:
      return state;
  }
};

export default SpecialOffersListReducer;
