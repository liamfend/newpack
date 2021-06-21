import Immutable from 'immutable';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { commissionActionTypes } from '~constants/actionTypes';

export const defaultState = Immutable.fromJS({
  communication: {
    create: defaultCommunicationObject,
    update: defaultCommunicationObject,
    delete: defaultCommunicationObject,
    propertyCommissionTiers: defaultCommunicationObject,
    landlordProperties: defaultCommunicationObject,
    bulkCreate: defaultCommunicationObject,
  },
  propertyCommissionTiers: {},
  landlordProperties: [],
});

const commissionReducer = (state = defaultState, action) => {
  switch (action.type) {
    case commissionActionTypes.CREATE_CS:
      return state.mergeDeep({
        communication: {
          create: updateCommunicationObject(action.status, action.error),
        },
      });

    case commissionActionTypes.UPDATE_CS:
      return state.mergeDeep({
        communication: {
          update: updateCommunicationObject(action.status, action.error),
        },
      });

    case commissionActionTypes.DELETE_CS:
      return state.mergeDeep({
        communication: {
          delete: updateCommunicationObject(action.status, action.error),
        },
      });
    case commissionActionTypes.SET_PROPERTY_COMMISSION_TIERS_CS:
      return state.set('propertyCommissionTiers', action.data);

    case commissionActionTypes.GET_PROPERTY_COMMISSION_TIERS_CS:
      return state.mergeDeep({
        communication: {
          propertyCommissionTiers: updateCommunicationObject(action.status, action.error),
        },
      });

    case commissionActionTypes.GET_LANDLORD_PROPERTIES_CS:
      return state.mergeDeep({
        communication: {
          landlordProperties: updateCommunicationObject(action.status, action.error),
        },
      });

    case commissionActionTypes.SET_LANDLORD_PROPERTIES:
      return state.set('landlordProperties', action.payload.edges || []);


    case commissionActionTypes.BULK_CREATE_CS:
      return state.mergeDeep({
        communication: {
          bulkCreate: updateCommunicationObject(action.status, action.error),
        },
      });

    default:
      return state;
  }
};

export default commissionReducer;
