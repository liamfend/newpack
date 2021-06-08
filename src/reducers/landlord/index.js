import Immutable from 'immutable';
import i18n from '~settings/i18n';
import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { landlordActionTypes } from '~constants/actionTypes';
import { formatAccountOwners } from '~helpers/account-owner';

export const defaultState = Immutable.fromJS({
  payload: {
    totalCount: 0,
    list: [],
  },
  communication: {
    list: defaultCommunicationObject,
    current: defaultCommunicationObject,
    create: defaultCommunicationObject,
    update: defaultCommunicationObject,
    propertyList: defaultCommunicationObject,
    bindAutoConfirmSettings: defaultCommunicationObject,
    getAccountOwners: defaultCommunicationObject,
    getSystemProviderList: defaultCommunicationObject,
    getReconciliationPreferenceList: defaultCommunicationObject,
  },
  current: null,
  preparedContract: null,
  properties: {
    totalCount: 0,
    list: [],
  },
  accountOwners: [],
  systemProviderList: [],
  reconciliationPreferenceList: [],
});

const formatLandlords = (landlords) => {
  const landlordData = {
    totalCount: 0,
    list: [],
  };
  if (
    !landlords ||
    landlords.edges.length === 0
  ) {
    return landlordData;
  }

  landlordData.totalCount = landlords.totalCount;
  landlordData.list = landlords.edges.map(landlord => landlord.node);

  return landlordData;
};

const formatPropertiesOfLandlord = (properties) => {
  const propertiesData = {
    totalCount: 0,
    list: [],
  };
  if (
    !properties ||
    properties.edges.length === 0
  ) {
    return propertiesData;
  }
  propertiesData.totalCount = properties.totalCount;
  propertiesData.list = properties.edges.map((property) => {
    const { id, name, city, status, paymentsEnabled } = property.node;
    return {
      id,
      propertyName: name,
      displayCity: city && city.name,
      displayCountry: city && city.country && city.country.name,
      status: i18n.t(`cms.landlord.property_related.property_status.${status.toLowerCase()}`),
      bookNowEnable: paymentsEnabled,
    };
  });

  return propertiesData;
};

const landlordReducer = (state = defaultState, action) => {
  switch (action.type) {
    case landlordActionTypes.SET_LANDLORDS: {
      return state.merge({
        payload: formatLandlords(action.payload),
      });
    }

    case landlordActionTypes.GET_LANDLORDS_CS:
      return state.mergeDeep({
        communication: {
          list: updateCommunicationObject(action.status, action.error),
        },
      });

    case landlordActionTypes.SET_CURRENT_LANDLORD: {
      return state.merge({
        current: action.payload,
      });
    }

    case landlordActionTypes.GET_LANDLORD_CS:
      return state.mergeDeep({
        communication: {
          current: updateCommunicationObject(action.status, action.error),
        },
      });

    case landlordActionTypes.SET_PREPARED_CONTRACT: {
      return state.merge({
        preparedContract: action.payload,
      });
    }

    case landlordActionTypes.CREATE_LANDLORD_CS:
      return state.mergeDeep({
        communication: {
          create: updateCommunicationObject(action.status, action.error),
        },
      });

    case landlordActionTypes.BIND_AUTO_CONFIRM_SETTINGS:
      return state.mergeDeep({
        communication: {
          bindAutoConfirmSettings: updateCommunicationObject(action.status, action.error),
        },
      });

    case landlordActionTypes.UPDATE_LANDLORD_CS:
      return state.mergeDeep({
        communication: {
          update: updateCommunicationObject(action.status, action.error),
        },
      });

    case landlordActionTypes.GET_PROPERTIES_BY_LANDLORD_SLUG_CS:
      return state.mergeDeep({
        communication: {
          propertyList: updateCommunicationObject(action.status, action.error),
        },
      });

    case landlordActionTypes.SET_PROPERTIES_OF_LANDLORD: {
      return state.merge({
        properties: formatPropertiesOfLandlord(action.payload.properties),
      });
    }

    case landlordActionTypes.SET_ACCOUNT_OWNERS:
      return state.mergeDeep({
        accountOwners: formatAccountOwners(action.data),
      });

    case landlordActionTypes.GET_ACCOUNT_OWNER_CS:
      return state.mergeDeep({
        communication: {
          getAccountOwners: updateCommunicationObject(action.status, action.error),
        },
      });
    case landlordActionTypes.SET_SYSTEM_PROVIDER_LIST:
      return state.mergeDeep({
        systemProviderList: action.payload,
      });
    case landlordActionTypes.GET_SYSTEM_PROVIDER_LIST_CS:
      return state.mergeDeep({
        communication: {
          getSystemProviderList: updateCommunicationObject(action.status, action.error),
        },
      });
    case landlordActionTypes.SET_RECONCILIATION_PREFERENCE_LIST:
      return state.mergeDeep({
        reconciliationPreferenceList: action.payload,
      });
    case landlordActionTypes.GET_RECONCILIATION_PREFERENCE_LIST_CS:
      return state.mergeDeep({
        communication: {
          getReconciliationPreferenceList: updateCommunicationObject(action.status, action.error),
        },
      });

    default:
      return state;
  }
};

export default landlordReducer;
