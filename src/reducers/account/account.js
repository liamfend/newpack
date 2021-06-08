import Immutable from 'immutable';
import { accountActionTypes } from '~constants/actionTypes';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';

export const defaultState = Immutable.fromJS({
  list: {
    payload: [],
    total: 0,
  },
  landlordList: {
    payload: [],
    total: 0,
  },
  communication: {
    create: defaultCommunicationObject,
    update: defaultCommunicationObject,
    list: defaultCommunicationObject,
    landlordList: defaultCommunicationObject,
    landlordCreate: defaultCommunicationObject,
    landlordUpdate: defaultCommunicationObject,
  },
  account: null,
});

const formatPayload = users =>
  users.map(user => ({
    id: user.node.id,
    slug: user.node.slug,
    firstName: user.node.firstName,
    lastName: user.node.lastName,
    email: user.node.email,
    updatedAt: user.node.updatedAt,
    userRoles: user.node.userRoles,
    userUuid: user.node.userUuid,
    enabled: user.node.enabled,
  }),
  );

const formatLandlordPayload = users =>
  users.map(user => ({
    id: user.node.id,
    firstName: user.node.firstName,
    lastName: user.node.lastName,
    updatedAt: user.node.updatedAt,
    enabled: user.node.enabled,
    email: user.node.email,
    landlord: user.node.company,
    properties: user.node.properties ? user.node.properties.edges : [],
  }),
  );

const accountReducer = (state = defaultState, action) => {
  switch (action.type) {
    case accountActionTypes.SET_CMS_USER:
      return state.merge({
        account: action.payload,
      });

    case accountActionTypes.CREATE_CS:
      return state.mergeDeep({
        communication: {
          create: updateCommunicationObject(action.status, action.error),
        },
      });

    case accountActionTypes.UPDATE_CS:
      return state.mergeDeep({
        communication: {
          update: updateCommunicationObject(action.status, action.error),
        },
      });

    case accountActionTypes.LANDLORD_CREATE_CS:
      return state.mergeDeep({
        communication: {
          landlordCreate: updateCommunicationObject(action.status, action.error),
        },
      });

    case accountActionTypes.LANDLORD_UPDATE_CS:
      return state.mergeDeep({
        communication: {
          landlordUpdate: updateCommunicationObject(action.status, action.error),
        },
      });

    case accountActionTypes.INITIALIZE:
      return state;

    case accountActionTypes.SET_LIST: {
      const nextState = state.deleteIn(['list', 'payload']);
      return nextState.mergeDeep({
        list: {
          payload: formatPayload(action.payload.edges),
          total: action.payload.totalCount,
        },
      });
    }

    case accountActionTypes.LIST_CS:
      return state.mergeDeep({
        communication: {
          list: updateCommunicationObject(action.status, action.error),
        },
      });

    case accountActionTypes.SET_ACCOUNT_LANDLORD_LIST: {
      const nextState = state.deleteIn(['landlordList', 'payload']);
      return nextState.mergeDeep({
        landlordList: {
          payload: formatLandlordPayload(action.payload.edges),
          total: action.payload.totalCount,
        },
      });
    }

    case accountActionTypes.ACCOUNT_LANDLORD_LIST_CS:
      return state.mergeDeep({
        communication: {
          landlordList: updateCommunicationObject(action.status, action.error),
        },
      });

    default:
      return state;
  }
};

export default accountReducer;
