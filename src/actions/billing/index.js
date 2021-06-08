import { billingActionTypes as actions } from '~constants/actionTypes';
import { fetch } from '~actions/shared';
import { sortDirectionMapping } from '~constants';
import endpoints from '~settings/endpoints';
import { formatSimpleParams } from '~helpers/params';
import * as queries from '~settings/queries';
import { message } from 'antd';
import i18n from '~settings/i18n';

export const setListOrderTransfers = payload => ({
  type: actions.SET_LIST_ORDER_TRANSFER,
  payload,
});

export const listOrderTransfers = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.listOrderTransfers(formatSimpleParams(
      {
        pageNumber: 1,
        pageSize: 10,
        sortBy: 'UPDATED_AT',
        sortDirection: sortDirectionMapping.descend,
        landlordSlug: null,
        propertySlug: null,
        orderReferenceId: null,
        receivableMethod: null,
        status: null,
        referenceId: null,
        PlanningTransferDatetimeEnd: null,
        PlanningTransferDatetimeStart: null,
        ActualTransferDatetimeEnd: null,
        ActualTransferDatetimeStart: null,
        transferType: null,
      },
      params,
    )),
    communicationType: actions.GET_LIST_ORDER_TRANSFER_CS,
    successAction: setListOrderTransfers,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const setOrderTransfer = payload => ({
  type: actions.SET_ORDER_TRANSFER,
  payload: payload.listOrderTransfers,
});

export const orderTransfer = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.orderTransferDetail(formatSimpleParams(
      {
        referenceId: null,
      },
      params,
    )),
    communicationType: actions.GET_ORDER_TRANSFER,
    successAction: setOrderTransfer,
    onError: (e) => {
      if (e && e.length > 0 && e[0].message &&
        e[0].message.indexOf('PROPERTY_WITHDRAW_METHOD_NOT_FOUN') !== -1) {
        message.error(i18n.t('cms.billing.transferred.withdraw.error'));
      } else {
        message.error(i18n.t('cms.properties.edit.toast.error'));
      }
    },
  });
};

export const pendingTransfers = (successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.pendingTransfers(),
    communicationType: actions.GET_PENDING_TRANSFER_COUNT,
    onSuccess: (res) => {
      const count = res && res.listOrderTransfers && res.listOrderTransfers.totalCount ?
        res.listOrderTransfers.totalCount : 0;
      successCallback(count);
    },
  });
};

export const pendingReceivables = (status, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.pendingReceivables(status),
    communicationType: actions.GET_PENDING_RECEIVABLES_COUNT,
    onSuccess: (res) => {
      const count = res && res.listOrderReceivables && res.listOrderReceivables.totalCount ?
        res.listOrderReceivables.totalCount : 0;
      successCallback(count);
    },
  });
};

export const updateOrderTransferStatus = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.updateOrderTransferStatus(params),
    communicationType: actions.UPDATE_ORDER_TRANSFERRED_CS,
    onSuccess: (res) => {
      successCallback(res);
      message.success(i18n.t('cms.billing.tarnsfer.transferred.success.tips'));
    },
    onError: (e) => {
      if (e && e.length > 0 && e[0].message) {
        if (e[0].message.indexOf('PROPERTY_WITHDRAW_METHOD_NOT_FOUN') !== -1) {
          message.error(i18n.t('cms.billing.transferred.withdraw.error'));
        } else if (e[0].message.indexOf('STATUS_ERROR') !== -1) {
          message.error(i18n.t('cms.billing.transferred.status.error'));
        } else {
          message.error(i18n.t('cms.properties.edit.toast.error'));
        }
      } else {
        message.error(i18n.t('cms.properties.edit.toast.error'));
      }
    },
  });
};

export const searchLandlordList = (value, successCallback = () => {}) => (dispatch) => {
  const query = queries.searchLandlordList(
    {
      pageNumber: 1,
      pageSize: 99,
      query: value,
    },
  );
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: query,
    communicationType: actions.LANDLORD_LIST_CS,
    onSuccess: (res) => {
      successCallback(res);
    },
  });
};

export const searchPropertyList = (value, successCallback = () => {}) => (dispatch) => {
  const query = queries.searchProperty(
    {
      pageNumber: 1,
      pageSize: 50,
      query: value,
    },
  );
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: query,
    communicationType: actions.PROPERTY_LIST_CS,
    onSuccess: (res) => {
      successCallback(res);
    },
  });
};

export const setListOrderReceivables = payload => ({
  type: actions.SET_LIST_ORDER_RECEIVE,
  payload,
});

export const listOrderReceivables = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.listOrderReceivables(formatSimpleParams(
      {
        pageNumber: 1,
        pageSize: 10,
        sortBy: 'UPDATED_AT',
        sortDirection: sortDirectionMapping.descend,
        landlordSlug: null,
        propertySlug: null,
        orderReferenceId: null,
        receivableMethod: null,
        status: null,
        referenceId: null,
        invoicedAtStart: null,
        invoicedAtEnd: null,
        paidAtStart: null,
        paidAtEnd: null,
        invoiceNumber: null,
      },
      params,
    )),
    communicationType: actions.GET_LIST_ORDER_RECEIVE_CS,
    successAction: setListOrderReceivables,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const setOrderReceive = payload => ({
  type: actions.SET_ORDER_RECEIVE,
  payload: payload.listOrderReceivables,
});

export const orderReceive = params => (dispatch) => {
  const filiter = {
    referenceId: params.id,
  };

  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.orderReceiveDetail(filiter),
    communicationType: actions.GET_ORDER_RECEIVE,
    successAction: setOrderReceive,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const updateOrderReceivable = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.updateOrderReceivable(params),
    communicationType: actions.UPDATE_ORDER_RECEIVABLE_CS,
    onSuccess: (res) => {
      successCallback(res);
      message.success(i18n.t(`cms.billing.tarnsfer.receivable.success.${params.status.toLowerCase()}.tips`));
    },
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const setListOrderRefunds = payload => ({
  type: actions.SET_LIST_ORDER_REFUND,
  payload,
});

export const listOrderRefunds = params => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.listOrderRefunds(formatSimpleParams(
      {
        pageNumber: 1,
        pageSize: 10,
        sortBy: 'UPDATED_AT',
        sortDirection: sortDirectionMapping.descend,
        landlordSlug: null,
        propertySlug: null,
        orderReferenceId: null,
        status: null,
        refundedAtEnd: null,
        refundedAtStart: null,
        refundFrom: null,
        refundTo: null,
        refundType: null,
      },
      params,
    )),
    communicationType: actions.GET_LIST_ORDER_REFUND_CS,
    successAction: setListOrderRefunds,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const setOrderRefund = payload => ({
  type: actions.SET_ORDER_REFUND,
  payload: payload.listOrderRefunds,
});

export const orderRefund = params => (dispatch) => {
  const filiter = {
    referenceId: params.id,
  };

  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.orderRefundDetail(formatSimpleParams(
      {
        referenceId: null,
      },
      filiter,
    )),
    communicationType: actions.GET_ORDER_REFUND,
    successAction: setOrderRefund,
    onError: () => {
      message.error(i18n.t('cms.properties.edit.toast.error'));
    },
  });
};

export const pendingRefunds = (status, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.pendingRefunds(status),
    communicationType: actions.GET_PENDING_REFUNDS_COUNT,
    onSuccess: (res) => {
      const count = res && res.listOrderRefunds && res.listOrderRefunds.totalCount ?
        res.listOrderRefunds.totalCount : 0;
      successCallback(count);
    },
  });
};

export const financialRefund = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.financialRefund(params),
    communicationType: actions.FINANCIAL_REFUNDED_CS,
    onSuccess: (res) => {
      successCallback(res);
      message.success(i18n.t('cms.billing.refund.financial_refund.success.tips'));
    },
    onError: (e) => {
      if (e && e.length > 0 && e[0].message) {
        if (e[0].message.indexOf('STATUS') !== -1) {
          message.error(i18n.t('cms.billing.refund.financial_refund.status.err'));
        } else {
          message.error(i18n.t('cms.properties.edit.toast.error'));
        }
      } else {
        message.error(i18n.t('cms.properties.edit.toast.error'));
      }
    },
  });
};

export const refundConfirm = (params, successCallback = () => {}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.refundConfirm(params),
    communicationType: actions.REFUNDED_CONFIRM_CS,
    onSuccess: (res) => {
      successCallback(res);
      message.success(i18n.t('cms.billing.refund.refund_confirm.success.tips'));
    },
    onError: (e) => {
      if (e && e.length > 0 && e[0].message) {
        if (e[0].message.indexOf('STATUS') !== -1) {
          message.error(i18n.t('cms.billing.refund.refund_confirm.status.err'));
        } else {
          message.error(i18n.t('cms.properties.edit.toast.error'));
        }
      } else {
        message.error(i18n.t('cms.properties.edit.toast.error'));
      }
    },
  });
};
