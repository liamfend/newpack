import moment from 'moment';
import i18n from '~settings/i18n';
import { contractStatus } from '~constants';

export const showEffectiveToDate = (effectiveTo) => {
  const openEndDate = '9999-12-31T00:00:00+00:00';

  if (effectiveTo === moment(openEndDate).format('YYYY-MM-DD')) {
    return i18n.t('cms.contract.effective_date.open_end');
  }

  return moment(effectiveTo).format('DD/MM/YYYY');
};

export const calContractStatus = (effectiveFrom, effectiveTo) => {
  if (moment().isBefore(moment(effectiveFrom))) {
    return contractStatus.INACTIVE;
  }
  if (moment().isAfter(moment(effectiveTo))) {
    return contractStatus.EXPIRED;
  }

  return contractStatus.ACTIVE;
};

export const other = () => {};
