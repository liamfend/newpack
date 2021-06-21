import Immutable from 'immutable';
import { offerListActionTypes } from '~constants/actionTypes';
import {
  defaultCommunicationObject,
  updateCommunicationObject,
} from '~reducers/shared';

export const defaultState = Immutable.fromJS({
  list: {
    payload: [],
    total: 0,
  },
  operatingOffer: {},
  communication: {
    list: defaultCommunicationObject,
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
    property: type.node.property,
  }));

const formatProperties = properties =>
  properties.edges.map(property => ({
    landlord: {
      name: property.node.landlord ? property.node.landlord.name : '',
    },
    name: property.node.name,
    slug: property.node.slug,
    id: property.node.id,
    unitTypes: formatUnitTypes(property.node.unitTypes),
  }));

const formatCities = cities =>
  cities.edges.map(city => ({
    name: city.node.name,
    slug: city.node.slug,
    id: city.node.id,
  }));

const formatListings = listings =>
  listings.edges.map(listing => ({
    id: listing.node.id,
    moveIn: listing.node.moveIn,
    moveOut: listing.node.moveOut,
    unitType: listing.node.unitType,
    type: listing.node.type,
  }));

const formatPayload = SpecialOffers =>
  SpecialOffers.map(specialOffer => ({
    key: specialOffer.node.id,
    id: specialOffer.node.id,
    internalTitle: specialOffer.node.internalTitle,
    startDate: specialOffer.node.startDate,
    notes: specialOffer.node.notes,
    title: specialOffer.node.title,
    fulfillmentInstructions: specialOffer.node.fulfillmentInstructions,
    properties: formatProperties(specialOffer.node.properties),
    unitTypes: formatUnitTypes(specialOffer.node.unitTypes),
    listings: formatListings(specialOffer.node.listings),
    cities: formatCities(specialOffer.node.cities),
    endDate: specialOffer.node.endDate,
    createdAt: specialOffer.node.createdAt,
    amount: specialOffer.node.amount,
    locales: specialOffer.node.locales,
    referralCode: specialOffer.node.referralCode,
    offerType: specialOffer.node.offerType,
    ownerType: specialOffer.node.ownerType,
    exclusive: specialOffer.node.exclusive,
    description: specialOffer.node.description,
    link: specialOffer.node.link,
    termsAndConditions: specialOffer.node.termsAndConditions,
    maxBookings: specialOffer.node.maxBookings,
    ipAddresses: specialOffer.node.ipAddresses,
    minTenancyValue: specialOffer.node.minTenancyValue,
    tenancyUnit: specialOffer.node.tenancyUnit,
  }));

const SpecialOffersListReducer = (state = defaultState, action) => {
  switch (action.type) {
    case offerListActionTypes.INITIALIZE:
      return state;

    case offerListActionTypes.SET_LIST: {
      const nextState = state.deleteIn(['list', 'payload']);
      return nextState.mergeDeep({
        list: {
          payload: formatPayload(action.payload.edges),
          total: action.payload.totalCount,
        },
      });
    }

    case offerListActionTypes.LIST_CS:
      return state.mergeDeep({
        communication: {
          list: updateCommunicationObject(action.status, action.error),
        },
      });

    case offerListActionTypes.CREATE_CS:
      return state.mergeDeep({
        communication: {
          create: updateCommunicationObject(action.status, action.error),
        },
      });

    case offerListActionTypes.UPDATE_CS:
      return state.mergeDeep({
        communication: {
          update: updateCommunicationObject(action.status, action.error),
        },
      });

    case offerListActionTypes.DELETE_CS:
      return state.mergeDeep({
        communication: {
          delete: updateCommunicationObject(action.status, action.error),
        },
      });

    case offerListActionTypes.SET_OPERATING_OFFER: {
      const nextState = state.deleteIn(['operatingOffer']);
      if (action.payload.properties && action.payload.properties.edges) {
        return nextState.mergeDeep({
          operatingOffer: formatPayload([{ node: action.payload }])[0],
        });
      }
      return nextState.mergeDeep({
        operatingOffer: action.payload,
      });
    }

    default:
      return state;
  }
};

export default SpecialOffersListReducer;
