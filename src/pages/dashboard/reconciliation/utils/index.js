import moment from 'moment';
import i18next from 'i18next';
import fileDownload from 'js-file-download';
import axios from 'axios';
import cookies from 'js-cookie';
import { message } from 'antd';
import endpoints from '~settings/endpoints';
import { cookieNames } from '~constants';

export const dateToString = (dt) => { // datetime class   //'yyyy-MM-dd'
  if (dt.format) {
    return dt.format('D MMM YYYY');
  }
  return '';
};
export const stringDateFormat = dt => (dt ? moment(dt).format('DD/MM/YYYY') : '-');
export const SE2Str = (arr) => {
  if (arr.length === 2) {
    if (!arr[0].format) {
      // eslint-disable-next-line
      arr[0] = moment(arr[0]);
    }
    if (!arr[1].format) {
      // eslint-disable-next-line
      arr[1] = moment(arr[1]);
    }
    return `${dateToString(arr[0])} - ${dateToString(arr[1])}`;
  }
  return arr.length;
};


export const getSecondaryStatus = (status1) => {
  // 该方法对应的状态  必须和翻译文件里顺序一样。。
  let result = {
    value: [],
    keys: [],
  };
  switch (status1) {
    case 'PENDING_APPROVAL':
      result = {
        keys: ['PENDING_START', 'CASE_ASSIGNED', 'CASE_DONE', 'CASE_CLOSED'],
        value: i18next.t('cms.reconciliation.booking.status.utils.sencondary.pending_approval').split(','),
      };
      break;
    case 'APPROVED':
      result = {
        keys: ['APPROVED_BREAK_LEASE', 'FULLY_APPROVED'],
        value: i18next.t('cms.reconciliation.booking.status.utils.sencondary.approved').split(','),
      };
      break;
    case 'UNCLAIMABLE':
      result = {
        keys: ['NO_BOOKING_PROOF', 'AGENT_CLASH', 'CAP_REACHED', 'ZERO_COMMISSION', 'REBOOKER', 'SHORT_STAY', 'MISCELLANEOUS', 'TENANCY_TAKEOVER', 'BOOKING_PROCESS', 'UNCLAIMABLE_BREAK_LEASE'],
        value: i18next.t('cms.reconciliation.booking.status.utils.sencondary.unclaimable').split(','),
      };
      break;
    default:
      break;
  }
  result.getValueByKey = function (key) {
    const index = result.keys.indexOf(key);
    return index > -1 ? result.value[index] : '';
  };
  return result;
};

export const getMainStatus = () => {
  // 该方法对应的状态  必须和翻译文件里顺序一样。。
  const result = {
    keys: ['READY_FOR_APPROVAL', 'PENDING_APPROVAL', 'APPROVED', 'READY_TO_INVOICE', 'INVOICED', 'PAID', 'CANCELLED', 'NO_SHOW', 'UNCLAIMABLE'],
    value: i18next.t('cms.reconciliation.booking.status.utils.main').split(','),
    getValueByKey(key) {
      const index = result.keys.indexOf(key);
      return index > -1 ? result.value[index] : '';
    },
  };

  return result;
};

export const getFilterOpportunityStage = () => {
  const result = {
    keys: ['COMPLETED', 'CANCELLATION'],
    value: i18next.t('cms.reconciliation.booking.status.utils.opportunity_stages').split(','),
    getValueByKey(key) {
      const index = result.keys.indexOf(key);
      return index > -1 ? result.value[index] : '';
    },
  };

  return result;
};

export const getListingMoveInType = (type) => {
  const moveintype = ['EXACTLY_MATCH', 'AFTER', 'ANYTIME', 'BEFORE'];
  const typeValue = i18next.t('cms.reconciliation.booking.status.utils.movetype').split(',');
  const index = moveintype.findIndex(m => m === type);
  return index > -1 ? typeValue[index] : '-';
};

export const getDailyStr = (type) => {
  const moveintype = ['DAILY', 'WEEKLY', 'MONTHLY'];
  const typeValue = i18next.t('cms.reconciliation.booking.status.utils.daily').split(',');
  const index = moveintype.findIndex(m => m === type);
  return index > -1 ? typeValue[index] : '-';
};


export const getGender = (type) => {
  const moveintype = ['FEMALE', 'MALE'];
  const typeValue = i18next.t('cms.reconciliation.booking.status.utils.gender').split(',');
  const index = moveintype.findIndex(m => m === type);
  return index > -1 ? typeValue[index] : '-';
};


export const getPendingReason = () => {
  const result = {
    keys: ['STUDENT_CANCELLATION',
      'STUDENT_NO_SHOW',
      'INCOMPLETE',
      'NO_BOOKING_PROOF',
      'AGENT_CLASH',
      'CAP_REACHED',
      'ZERO_COMMISSION',
      'REBOOKER',
      'SHORT_STAY',
      'MISCELLANEOUS',
      'BREAK_LEASE',
      'BOOKING_PROCESS',
      'TENANCY_TAKEOVER',
    ],
    value: i18next.t('cms.reconciliation.booking.status.utils.pending_reason').split(','),
    //
    getValueByKey(key) {
      const index = result.keys.indexOf(key);
      return index > -1 ? result.value[index] : '';
    },
  };

  return result;
};

export const downloadExcelFile = fileName => axios({
  method: 'GET',
  url: endpoints.downloadOpportunityBulkUpdateExcel.url(fileName),
  headers: {
    Authorization: `Bearer ${cookies.get(cookieNames.token)}`,
  },
  responseType: 'blob',
}).then((res) => {
  fileDownload(res.data, fileName);
}).catch((err) => {
  console.log('download excel file error: ', err);
  message.error(i18next.t('cms.reconciliation.booking.bulk_update_modal.download.error'));
});
