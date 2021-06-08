
import endpoints from '~settings/endpoints';
import { get } from 'lodash';
import i18n from '~settings/i18n';
import { fetch } from '~actions/shared';
import * as comQueries from '~settings/queries';
import { message } from 'antd';
import * as actions from './actionTypes';
import * as queries from './queries';
/* eslint-disable   */

const CommonFetech = (successCallback,doneCall)=> ({
  endpoint: endpoints.defaultUrl.url(),
  onSuccess: (res) => {
    successCallback && successCallback(res); 
    doneCall&&doneCall()
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
    doneCall&&doneCall()
  }
})

export const setReconciliationLandlordOpportunities = payload => ({
  type: actions.SET_RECONCILIATION_OPPORTUNITY_LIST,
  payload,
});

export const listLandlordReconciliationOpportunities = (params, { successCallback, isExport=false, finishCallback }) => (dispatch) => {
  let fetchParams =  {
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.listLandlordReconciliationOpportunities(Object.assign(
      {
        completedAtStart: '2019-01-01',
      },
      params,
    )),
    communicationType: actions.GET_RECONCILIATION_OPPORTUNITY_LIST,
    successAction: setReconciliationLandlordOpportunities,
    onSuccess: (res) => {
      successCallback && successCallback(res); 
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
    onFinish: () => {
      finishCallback && finishCallback();
    },
  }   
  if(isExport){
     delete fetchParams.successAction
  }
  fetch(
    fetchParams
  );
};

export const getLandlordReconciliation = (params, successCallback) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.getLandlordReconciliation(params),
    communicationType: actions.GET_RECONCIL_LANDLORD, 
    onSuccess: (res) => {
      successCallback && successCallback(res); 
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
export const getLandlordProperties = (params, successCallback) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: comQueries.landlordProperties(Object.assign(
      {
        statuses:['PUBLISHED','UNPUBLISHED']
      },
      params,
    )),
    communicationType: actions.GET_RECONCIL_PROPERTIES, 
    onSuccess: (res) => {
      successCallback && successCallback(res); 
    },
    onError: (e) => {
      console.error(e);
    },
  });
}; 

export const getCommission = (params, successCallback) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.listReconciliationComission(params),
    communicationType: actions.GET_RECONCIL_COMISSION, 
    onSuccess: (res) => {
      successCallback && successCallback(res);
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

export const getReconciliationOpportunityDetails = (params, successCallback) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.getReconciliationOpportunityDetails(params), 
    communicationType: actions.GET_RECONCIL_BOOKING_DETAILS,
    onSuccess: (res) => {
      successCallback && successCallback(res);
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

export const getbookingPendingNotes = (params, successCallback) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.listOpportunityPendingNotes(Object.assign(
      {
        
      },
      params,
    )), 
    communicationType: actions.GET_RECONCIL_BOOKING_PENDING_NOTES, 
    onSuccess: (res) => {
      successCallback && successCallback(get(res.listOpportunityPendingNotes, 'edges', []).map(({node}) => node)); 
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

export const updateLandlordStatus = (params, successCallback) => {
  fetch({
     ...CommonFetech(successCallback),
    params: queries.setLandlordBookingStatus(params),  
    
  });
};

export const checkActiveOpportunityCasesExist = (params, successCallback,doneCall) => {
  fetch({
     ...CommonFetech(successCallback,doneCall),
    params: queries.checkActiveOpportunityCasesExist(params), 
  });
};

export const closeActiveOpportunityCases = (params, successCallback) => {
  fetch({
     ...CommonFetech(successCallback),
    params: queries.closeActiveOpportunityCases(params), 
  });
};

export const createOpportunityCase = (params, successCallback) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.createOpportunityCase(params),
    communicationType: actions.CREATE_OPPORTUNITY_CASE,
    onSuccess: (res) => {
      successCallback && successCallback(res); 
    },
    onError: (error) => {
      message.error(i18n.t('cms.reconciliation.booking.details.comment.assign.exist.error'));
    },
  });
};

export const reconciliationUpdateOpportunity = (params, {successCallback, errorCallback, finishCallback}) => (dispatch) => {
  fetch({
    dispatch,
    endpoint: endpoints.defaultUrl.url(),
    params: queries.reconciliationUpdateOpportunity(params),
    communicationType: actions.UPDATE_RECONCIL_BOOKING_DETAILS,
    onSuccess: (res) => {
      successCallback && successCallback(res); 
    },
    onError: (error) => {
      errorCallback && errorCallback(error); 
      message.error(get(error, ['0', 'message'], ""));
    },
    onFinish: () => finishCallback && finishCallback()
  });
};

