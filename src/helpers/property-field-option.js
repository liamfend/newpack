import {
  billingCycleOptions,
  typeOptions,
  rankTypeOptions,
  freeCancellationPeriodOptions,
  longtailFreeCancellationPeriodOptions,
} from '~constants/property-field-options';
import { isContactEmpty, getPhoneNumber } from '~helpers/property-edit';
import i18n from '~settings/i18n';

const getTextFromOptions = (value, options) => {
  const selectedOption = options.find(option => option.value === value);
  if (selectedOption) return i18n.t(selectedOption.text);
  return '';
};

export const getBillingCycleText = value => i18n.t(getTextFromOptions(value, billingCycleOptions));

export const getFreeCancellationPeriodText =
  value => getTextFromOptions(value, freeCancellationPeriodOptions);

export const getCancellationPeriodText =
  value => getTextFromOptions(value, longtailFreeCancellationPeriodOptions);

export const getTypeText = value =>
  getTextFromOptions(value, typeOptions);

export const getRankTypeText = value =>
  getTextFromOptions(value, rankTypeOptions);


export const getContactInfoText = (value) => {
  if (!value) return '';
  const valid =
    value.filter(item => !isContactEmpty(item));
  return valid.map((item) => {
    const stringArray = [];
    if (item.contactName) { stringArray.push(item.contactName); }
    if (getPhoneNumber(item.contactPhone)) { stringArray.push(item.contactPhone); }
    if (item.contactEmail) { stringArray.push(item.contactEmail); }
    return stringArray.join(' / ');
  }).join('<br />');
};

export const getAreaText = (value, property) => {
  const areas = property.getIn(['city', 'areas', 'edges']).toJS();
  if (!areas) return null;
  const item = areas.find(area => area.node.id === value);
  if (item) return item.node.name;
  return null;
};

export const getLinksText = (value) => {
  if (!value) return null;
  const enabled = value.filter(item => item.enabled && !!item.link);
  const list = enabled.map(item => `${item.link}(${item.displayRegion})`);
  return list.join('<br/>');
};

export const getRankTypeValue = ({ rankBlacksheep, rankStar }) => {
  if (rankStar) {
    return 'STAR';
  }
  if (rankBlacksheep) {
    return 'BLACKSHEEP';
  }

  return 'NORMAL';
};

export const getCoordindateText = (value) => {
  if (typeof value === 'number') {
    return value.toFixed(6);
  }
  return value;
};
