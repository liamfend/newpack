import { commissionActionTypes as actions } from '~constants/actionTypes';
import endpoints from '~settings/endpoints';
import { fetch } from '~actions/shared';
import * as queries from '~settings/queries';
import { message } from 'antd';
import i18n from '~settings/i18n';
import { formatSimpleParams } from '~helpers/params';

export const createCommission = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.commissionModal.url(),
    params: queries.createCommission(formatSimpleParams(
      {
        name: null,
        bonus: false,
        bookingCountFrom: null,
        bookingCountTo: null,
        capType: null,
        capValue: null,
        category: null,
        checkInDateFrom: null,
        checkInDateTo: null,
        convertedCalculationValue: null,
        description: null,
        effectiveFrom: null,
        effectiveTo: null,
        fullyCalculatable: null,
        listingId: null,
        propertyId: null,
        retrospectiveCommission: null,
        tenancyLengthFrom: null,
        tenancyLengthTo: null,
        tenancyUnit: null,
        type: null,
        value: null,
      },
      params,
    )),
    communicationType: actions.CREATE_CS,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
    onSuccess: () => {
      message.success(i18n.t('cms.property.commission.create_success.tips'));
    },
  });
};

export const updateCommission = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.commissionModal.url(),
    params: queries.updateCommission(params),
    communicationType: actions.UPDATE_CS,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
    onSuccess: () => {
      message.success(i18n.t('cms.property.commission.update_success.tips'));
    },
  });
};

export const deleteCommission = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.commissionModal.url(),
    params: queries.deleteCommission(params),
    communicationType: actions.DELETE_CS,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
    onSuccess: () => {
      message.success(i18n.t('cms.property.commission.delete_success.tips'));
    },
  });
};

export const setPropertyCommissionTiers = data => ({
  type: actions.SET_PROPERTY_COMMISSION_TIERS_CS,
  data: data.property,
});

export const getPropertyCommissionTiers = (slug, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.commissionModal.url(),
    params: queries.getPropertyCommissionTiers({ slug }),
    communicationType: actions.GET_PROPERTY_COMMISSION_TIERS_CS,
    successAction: setPropertyCommissionTiers,
    onSuccess: (res) => {
      successCallback(res);
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const setLandlordProperties = payload => ({
  type: actions.SET_LANDLORD_PROPERTIES,
  payload: payload.properties,
});

export const getLandlordProperties = slug => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.getLandlordProperties.url(),
    params: queries.landlordProperties({ slug }),
    communicationType: actions.GET_LANDLORD_PROPERTIES_CS,
    successAction: setLandlordProperties,
  });
};

export const bulkCreateCommissionTiers = commissionTiers => (dispatch) => {
  const bulkCreateParams = {};
  bulkCreateParams.commissionTiers = commissionTiers.map((commission) => {
    const formatedCommission = formatSimpleParams(
      {
        name: null,
        bonus: false,
        bookingCountFrom: null,
        bookingCountTo: null,
        capType: null,
        capValue: null,
        category: null,
        checkInDateFrom: null,
        checkInDateTo: null,
        convertedCalculationValue: null,
        description: null,
        effectiveFrom: null,
        effectiveTo: null,
        fullyCalculatable: null,
        listingId: null,
        propertyId: null,
        retrospectiveCommission: null,
        tenancyLengthFrom: null,
        tenancyLengthTo: null,
        tenancyUnit: null,
        type: null,
        value: null,
      },
      commission,
    );
    return formatedCommission;
  });
  fetch({
    dispatch,
    endpoint: endpoints.commissionModal.url(),
    params: queries.bulkCreateCommissionTiers(bulkCreateParams),
    communicationType: actions.BULK_CREATE_CS,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
    onSuccess: () => {
      message.success(i18n.t('cms.property.commission.bulk_create_success.tips', {
        propertyCount: commissionTiers.length,
      }));
    },
  });
};
