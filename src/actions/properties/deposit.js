import { depositActionTypes as actions } from '~constants/actionTypes';
import endpoints from '~settings/endpoints';
import { fetch } from '~actions/shared';
import * as queries from '~settings/queries';
import { message } from 'antd';
import i18n from '~settings/i18n';
import { formatSimpleParams } from '~helpers/params';

export const createDeposit = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.depositUrl.url(),
    params: queries.createDeposit(formatSimpleParams(
      {
        firstInstalment: false,
        paymentProcessingFee: false,
        propertyId: null,
        type: null,
        name: null,
        value: null,
      },
      params,
    )),
    communicationType: actions.CREATE_CS,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
    onSuccess: () => {
      message.success(i18n.t('cms.deposit_and_fees.deposit_modal.create_success.tips'));
      successCallback();
    },
  });
};

export const updateDeposit = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.depositUrl.url(),
    params: queries.updateDeposit(params),
    communicationType: actions.UPDATE_CS,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
    onSuccess: () => {
      message.success(i18n.t('cms.deposit_and_fees.deposit_modal.update_success.tips'));
      successCallback();
    },
  });
};

export const deletedDeposit = (id, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.depositUrl.url(),
    params: queries.deletedDeposit(id),
    communicationType: actions.DELETE_CS,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
    onSuccess: () => {
      message.success(i18n.t('cms.deposit_and_fees.deposit_modal.deleted_success.tips'));
      successCallback();
    },
  });
};

export const updatePropertyPaymentsEnabled = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.depositUrl.url(),
    params: queries.enableBookNow(params),
    communicationType: actions.UPDATE_PROPERTY_CS,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
    onSuccess: () => {
      successCallback();
      message.success(i18n.t(
        `cms.deposit_and_fees.update_property.book_now_${params.paymentsEnabled ? 'enable' : 'disable'}_success.tips`,
      ));
    },
  });
};

const setPropertyDepositePayment = data => ({
  type: actions.SET_PROPERTY_DEPOSIT_CS,
  data,
});

export const getPropertyDepositePayment = (slug, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.depositUrl.url(),
    params: queries.getPropertyDepositePayment({ slug }),
    communicationType: actions.GET_PROPERTY_DEPOSIT_CS,
    successAction: setPropertyDepositePayment,
    onSuccess: (res) => {
      successCallback(res);
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};
