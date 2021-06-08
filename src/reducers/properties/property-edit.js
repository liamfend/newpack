import Immutable, { List } from 'immutable';
import { propertyEditActionType as actions, pendingApprovalActionTypes as pendingApprovalActions } from '~constants/actionTypes';

import { defaultCommunicationObject, updateCommunicationObject } from '~reducers/shared';
import { getEditedFieldsValidate, clearSavedFields } from '~helpers/property-edit';
import generatePath from '~settings/routing';

const defaultEditedFields = {
  details: {},
  address: {},
  facilities: {},
  rooms: {},
  unit: {},
  gallery: {},
  roomsDataChanged: false,
  listingsDataChanged: false,
  bulkListingsDataChanged: false,
  virtualLinks: {},
  referenceAndContact: {},
};

const defaultEditedFieldsValidate = {
  details: true,
  address: true,
  facilities: true,
  units: true,
  listings: true,
  gallery: true,
  rooms: true,
  referenceAndContact: true,
};

const defaultCommunication = {
  getDetail: defaultCommunicationObject,
  save: defaultCommunicationObject,
  publish: defaultCommunicationObject,
  unpublish: defaultCommunicationObject,
};

export const defaultState = Immutable.fromJS({
  payload: {},
  editedFields: defaultEditedFields,
  editedFieldsValidate: defaultEditedFieldsValidate,
  communication: defaultCommunication,
  cloneRoomListingData: [],
  mergedDraftProperty: {},
});

const isList = List.isList;
const mergeWithoutList = (a, b) => {
  if (a && a.mergeWith && !isList(a) && !isList(b)) {
    return a.mergeWith(mergeWithoutList, b);
  }
  return b;
};

const propertyEditReducer = (state = defaultState, action) => {
  switch (action.type) {
    case actions.UPDATE_PROPERTY_PAYLOAD:
      return state.setIn(['payload', 'links'], action.links);

    case actions.SET_PROPERTY:
      return state.merge({
        payload: action.payload,
        editedFields: defaultEditedFields,
        communication: defaultCommunication,
        editedFieldsValidate: defaultEditedFieldsValidate,
        cloneRoomListingData: action.payload && action.payload.unitTypes ?
          action.payload.unitTypes.edges : [],
      });

    case actions.RESET_PROPERTY:
    {
      const originalSlug = state.getIn(['payload', 'slug']);
      if (action.property.slug !== originalSlug) {
        window.history.pushState(null, null, generatePath('property.edit', { propertySlug: action.property.slug }));
      }
      return state.merge({
        editedFields: clearSavedFields(state.get('editedFields').toJS()),
        payload: Object.assign({}, action.property, { city: state.getIn(['payload', 'city']).toJS() }),
        cloneRoomListingData: action.property.unitTypes ? action.property.unitTypes.edges : [],
      });
    }

    case actions.RESET_MERGED_PROPERTY:
    {
      return state.merge({
        editedFields: clearSavedFields(state.get('editedFields').toJS()),
        cloneRoomListingData: action.property.unitTypes ? action.property.unitTypes.edges : [],
        mergedDraftProperty: {},
      });
    }

    case actions.SET_ROOMS_LISTINGS:
      return state.set('cloneRoomListingData', Immutable.fromJS(action.data));

    case actions.GET_PROPERTY_CS:
      return state.mergeDeep({
        communication: {
          getDetail: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.SET_EDITED_FIELDS:
    {
      let editedData;
      if (typeof action.editedTab === 'string') {
        editedData = JSON.parse(action.editedTab);
      } else {
        editedData = action.editedTab;
      }
      const editedFields = mergeWithoutList(
        state.get('editedFields'),
        Immutable.fromJS(editedData),
      ).toJS();
      const editedFieldsValidate = getEditedFieldsValidate(editedFields);
      return state.merge({
        editedFields,
        editedFieldsValidate,
      });
    }

    case actions.SAVE_PROPERTY_CS:
      return state.mergeDeep({
        communication: {
          save: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.PUBLISH_PROPERTY_CS:
      return state.mergeDeep({
        communication: {
          publish: updateCommunicationObject(action.status, action.error),
        },
      });

    case actions.RESET_PROPERTY_STATUS:
      return state.mergeDeep({
        payload: Object.assign({}, action.property, { status: state.getIn(['payload', 'status']) === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED' }),
      });

    case actions.SET_ROOMS_DATA_CHANGED:
      return state.setIn(['editedFields', 'roomsDataChanged'], action.data);

    case actions.SET_LISTINGS_DATA_CHANGED:
      return state.setIn(['editedFields', 'listingsDataChanged'], action.data);

    case actions.SET_BULK_LISTINGS_DATA_CHANGED:
      return state.setIn(['editedFields', 'bulkListingsDataChanged'], action.data);

    case pendingApprovalActions.SET_MERGED_DRAFT_PROPERTY:
      return state.mergeDeep({
        mergedDraftProperty: action.payload,
      });

    default:
      return state;
  }
};

export default propertyEditReducer;
