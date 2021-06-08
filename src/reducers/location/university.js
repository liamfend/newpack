import Immutable from 'immutable';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { universityActionTypes } from '~constants/actionTypes';

export const defaultState = Immutable.fromJS({
  list: {
    payload: [],
    total: 0,
  },
  university: {
    payload: null,
  },
  baseUniversity: {
    payload: null,
  },
  communication: {
    list: defaultCommunicationObject,
    university: defaultCommunicationObject,
    create: defaultCommunicationObject,
    update: defaultCommunicationObject,
  },
});

const formatPayload = universities =>
  universities.map(university => ({
    id: university.node.id,
    name: university.node.name,
    slug: university.node.slug,
    cityName: university.node.city ? university.node.city.originalName : '',
    citySlug: university.node.city ? university.node.city.slug : '',
    published: university.node.published,
    commonNames: university.node.commonNames,
    commonNamesCount: university.node.commonNamesCount,
    data: university.node,
  }),
  );

const universityReducer = (state = defaultState, action) => {
  switch (action.type) {
    case universityActionTypes.INITIALIZE:
      return state;

    case universityActionTypes.SET_LIST: {
      const nextState = state.deleteIn(['list', 'payload']);
      return nextState.mergeDeep({
        list: {
          payload: formatPayload(action.payload.edges),
          total: action.payload.totalCount,
        },
      });
    }

    case universityActionTypes.LIST_CS:
      return state.mergeDeep({
        communication: {
          list: updateCommunicationObject(action.status, action.error),
        },
      });

    case universityActionTypes.SET_UNIVERSITY_DETAIL: {
      const nextState = state.deleteIn(['university', 'payload']);
      return nextState.mergeDeep({
        university: {
          payload: action.payload,
        },
      });
    }

    case universityActionTypes.SET_UNIVERSITY_BASE: {
      const nextState = state.deleteIn(['baseArea', 'payload']);
      return nextState.mergeDeep({
        baseUniversity: {
          payload: action.payload,
        },
      });
    }

    case universityActionTypes.GET_UNIVERSITY_DETAIL_CS:
      return state.mergeDeep({
        communication: {
          university: updateCommunicationObject(action.status, action.error),
        },
      });

    case universityActionTypes.CREATE_CS:
      return state.mergeDeep({
        communication: {
          create: updateCommunicationObject(action.status, action.error),
        },
      });

    case universityActionTypes.UPDATE_CS:
      return state.mergeDeep({
        communication: {
          update: updateCommunicationObject(action.status, action.error),
        },
      });

    default:
      return state;
  }
};

export default universityReducer;
