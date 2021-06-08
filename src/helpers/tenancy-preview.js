import moment from 'moment';
import i18n from '~settings/i18n';

const listingDateTypes = {
  EXACTLY_MATCH: 'EXACTLY_MATCH',
  AFTER: 'AFTER',
  BEFORE: 'BEFORE',
  ANYTIME: 'ANYTIME',
  // tenancy types
  EQUALS: 'EQUALS',
  NO_LESS_THAN: 'NO_LESS_THAN',
  NO_MORE_THAN: 'NO_MORE_THAN',
  NOT_SPECIFIC: 'NOT_SPECIFIC',
  BETWEEN: 'BETWEEN',
};

const moveInDescriptionLogic = (moveInType, moveIn, isPreview) => {
  if (moveInType === listingDateTypes.EXACTLY_MATCH && moveIn) {
    // move in a
    return i18n.t('cms.listing.move_in_desc.normal', { date: moment(moveIn).format('ll') });
  }
  if (moveInType === listingDateTypes.AFTER && moveIn) {
    const today = moment().endOf('day');
    if (isPreview && moment(moveIn) < today) {
      // move in today
      return i18n.t('cms.listing.move_in_desc.today');
    }
    // move in after a
    return i18n.t('cms.listing.move_in_desc.after', { date: moment(moveIn).format('ll') });
  }
  if (moveInType === listingDateTypes.ANYTIME) {
    // move in anytime
    return i18n.t('cms.listing.move_in_desc.anytime');
  }

  return '';
};

const moveOutDescriptionLogic = (moveOutType, moveOut) => {
  if (moveOutType === listingDateTypes.ANYTIME) {
    // move out anytime
    return i18n.t('cms.listing.move_out_desc.anytime');
  }
  if (moveOutType === listingDateTypes.BEFORE && moveOut) {
    // move out before c
    return i18n.t('cms.listing.move_out_desc.before', { date: moment(moveOut).format('ll') });
  }
  if (moveOutType === listingDateTypes.EXACTLY_MATCH && moveOut) {
    // move out before c
    return i18n.t('cms.listing.move_out_desc.normal', { date: moment(moveOut).format('ll') });
  }

  return '';
};

const tenancyDescriptionLogic = (
  tenancyType,
  tenancyValueMin,
  tenancyValueMax,
  billingCycle,
) => {
  if (tenancyType === listingDateTypes.EQUALS && tenancyValueMin && billingCycle) {
    // fixed stay b
    return i18n.t('cms.listing.tenancy_desc.equals', {
      tenancyValueMin,
      billingCycle: i18n.t(`cms.listing.billing_cycle.${billingCycle ? billingCycle.toLowerCase() : 'weekly'}`),
    });
  }
  if (tenancyType === listingDateTypes.NO_LESS_THAN && tenancyValueMin && billingCycle) {
    // min stay b
    return i18n.t('cms.listing.tenancy_desc.no_less_than', {
      tenancyValueMin,
      billingCycle: i18n.t(`cms.listing.billing_cycle.${billingCycle ? billingCycle.toLowerCase() : 'weekly'}`),
    });
  }
  if (tenancyType === listingDateTypes.NO_MORE_THAN && tenancyValueMin && billingCycle) {
    // max stay b
    return i18n.t('cms.listing.tenancy_desc.no_more_than', {
      tenancyValueMin,
      billingCycle: i18n.t(`cms.listing.billing_cycle.${billingCycle ? billingCycle.toLowerCase() : 'weekly'}`),
    });
  }
  if (tenancyType === listingDateTypes.BETWEEN &&
      tenancyValueMin &&
      tenancyValueMax &&
      billingCycle
  ) {
    // stay between b-b1
    return i18n.t('cms.listing.tenancy_desc.between', {
      tenancyValueMin,
      tenancyValueMax,
      billingCycle: i18n.t(
        `cms.listing.billing_cycle.${billingCycle ? billingCycle.toLowerCase() : 'weekly'}`,
      ),
    });
  }

  return '';
};

const handleTenancy = (
  moveIn,
  moveOut,
  moveInType,
  moveOutType,
  billingCycle,
  tenancyLengthType,
  tenancyLengthValueMin,
  tenancyLengthValueMax = null,
  isPreview = false,
) => ({
  moveIn: moveInDescriptionLogic(moveInType, moveIn),
  moveInPreview: moveInDescriptionLogic(moveInType, moveIn, isPreview),
  moveOut: moveOutDescriptionLogic(moveOutType, moveOut),
  stay: tenancyDescriptionLogic(
    tenancyLengthType,
    tenancyLengthValueMin,
    tenancyLengthValueMax,
    billingCycle,
  ),
});

export default handleTenancy;
