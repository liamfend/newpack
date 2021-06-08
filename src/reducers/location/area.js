import Immutable from 'immutable';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { areaActionTypes } from '~constants/actionTypes';

export const defaultState = Immutable.fromJS({
  list: {
    payload: [],
    total: 0,
  },
  area: {
    payload: null,
  },
  baseArea: {
    payload: null,
  },
  communication: {
    list: defaultCommunicationObject,
    area: defaultCommunicationObject,
    create: defaultCommunicationObject,
    update: defaultCommunicationObject,
  },
});

const formatPayload = areas =>
  areas.map(area => ({
    id: area.node.id,
    slug: area.node.slug,
    name: area.node.name,
    published: area.node.published,
    properties: area.node.properties || 0,
    publishedProperties: area.node.publishedProperties || 0,
    citySlug: area.node.city ? area.node.city.slug : '',
    cityName: area.node.city ? area.node.city.originalName : '',
    data: area.node,
  }),
  );

const areaReducer = (state = defaultState, action) => {
  switch (action.type) {
    case areaActionTypes.INITIALIZE:
      return state;

    case areaActionTypes.SET_LIST: {
      const nextState = state.deleteIn(['list', 'payload']);
      return nextState.mergeDeep({
        list: {
          payload: formatPayload(action.payload.edges),
          total: action.payload.totalCount,
        },
      });
    }

    case areaActionTypes.SET_AREA_BASE: {
      const nextState = state.deleteIn(['baseArea', 'payload']);
      return nextState.mergeDeep({
        baseArea: {
          payload: action.payload,
        },
      });
    }

    case areaActionTypes.LIST_CS:
      return state.mergeDeep({
        communication: {
          list: updateCommunicationObject(action.status, action.error),
        },
      });

    case areaActionTypes.CREATE_CS:
      return state.mergeDeep({
        communication: {
          create: updateCommunicationObject(action.status, action.error),
        },
      });

    case areaActionTypes.UPDATE_CS:
      return state.mergeDeep({
        communication: {
          update: updateCommunicationObject(action.status, action.error),
        },
      });

    case areaActionTypes.SET_AREA_DETAIL: {
      const nextState = state.deleteIn(['area', 'payload']);
      return nextState.mergeDeep({
        area: {
          payload: action.payload,
        },
      });
    }

    case areaActionTypes.GET_AREA_DETAIL_CS:
      return state.mergeDeep({
        communication: {
          area: updateCommunicationObject(action.status, action.error),
        },
      });

    default:
      return state;
  }
};

export default areaReducer;
