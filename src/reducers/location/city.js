import Immutable from 'immutable';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { cityActionTypes } from '~constants/actionTypes';

export const defaultState = Immutable.fromJS({
  list: {
    payload: [],
    total: 0,
  },
  city: {
    payload: null,
  },
  baseCity: {
    payload: null,
  },
  communication: {
    list: defaultCommunicationObject,
    city: defaultCommunicationObject,
    create: defaultCommunicationObject,
    update: defaultCommunicationObject,
  },
});

const formatPayload = cities =>
  cities.map(city => ({
    id: city.node.id,
    name: city.node.name,
    citySlug: city.node.slug,
    countryName: city.node.country.originalName,
    countrySlug: city.node.country.slug,
    numOfProperties: city.node.properties,
    publishedProperties: city.node.publishedProperties,
    published: city.node.published,
    data: city.node,
  }),
  );

const cityReducer = (state = defaultState, action) => {
  switch (action.type) {
    case cityActionTypes.INITIALIZE:
      return state;

    case cityActionTypes.SET_CITY_DETAIL: {
      const nextState = state.deleteIn(['city', 'payload']);
      return nextState.mergeDeep({
        city: {
          payload: action.payload,
        },
      });
    }

    case cityActionTypes.SET_CITY_BASE: {
      const nextState = state.deleteIn(['baseCity', 'payload']);
      return nextState.mergeDeep({
        baseCity: {
          payload: action.payload,
        },
      });
    }

    case cityActionTypes.GET_CITY_DETAIL_CS:
      return state.mergeDeep({
        communication: {
          city: updateCommunicationObject(action.status, action.error),
        },
      });

    case cityActionTypes.SET_LIST: {
      const nextState = state.deleteIn(['list', 'payload']);
      return nextState.mergeDeep({
        list: {
          payload: formatPayload(action.payload.edges),
          total: action.payload.totalCount,
        },
      });
    }

    case cityActionTypes.LIST_CS:
      return state.mergeDeep({
        communication: {
          list: updateCommunicationObject(action.status, action.error),
        },
      });

    case cityActionTypes.CREATE_CS:
      return state.mergeDeep({
        communication: {
          create: updateCommunicationObject(action.status, action.error),
        },
      });

    case cityActionTypes.UPDATE_CS:
      return state.mergeDeep({
        communication: {
          update: updateCommunicationObject(action.status, action.error),
        },
      });

    default:
      return state;
  }
};

export default cityReducer;
