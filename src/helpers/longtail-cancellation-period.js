import i18next from 'i18next';
import { longtailFreeCancellationPeriodOptions } from '~constants/property-field-options';

export const longtailCancellationPeriod = {
  BEFORE_MOVE_IN_CALENDAR_DAYS_0: 'BEFORE_MOVE_IN_CALENDAR_DAYS_0',
  BEFORE_MOVE_IN_CALENDAR_DAYS_7: 'BEFORE_MOVE_IN_CALENDAR_DAYS_7',
  BEFORE_MOVE_IN_CALENDAR_DAYS_14: 'BEFORE_MOVE_IN_CALENDAR_DAYS_14',
  BEFORE_MOVE_IN_CALENDAR_DAYS_30: 'BEFORE_MOVE_IN_CALENDAR_DAYS_30',
  BEFORE_MOVE_IN_CALENDAR_DAYS_60: 'BEFORE_MOVE_IN_CALENDAR_DAYS_60',
  BEFORE_MOVE_IN_CALENDAR_DAYS_90: 'BEFORE_MOVE_IN_CALENDAR_DAYS_90',
  NON_REFUNDABLE: 'NON_REFUNDABLE',
};


export const getFreeCancellationPeriodText = (freeCancellationPeriod) => {
  let describe = i18next.t('cms.free_cancellation_policy.booking_paid.title');

  longtailFreeCancellationPeriodOptions.map((item) => {
    if (freeCancellationPeriod === item.value) {
      describe = item.text;
    }
    return true;
  });

  return describe;
};

export const withInRules = {
  rule_1: {
    icon: 'check',
    text: 'cms.free_cancellation_policy.rule_1',
  },
  rule_2: {
    icon: 'check',
    text: 'cms.free_cancellation_policy.rule_2',
  },
  rule_3: {
    icon: 'close',
    text: 'cms.free_cancellation_policy.rule_3',
    tip: 'cms.free_cancellation_policy.rule_3.tips',
  },
};


export const allcancellationTrans = {
  NON_REFUNDABLE: {
    withIn: null,
    withOut: {
      title: 'cms.cancellation_policy.card.with_out.title',
      desc: 'cms.cancellation_policy.card.with_out.0_day.desc',
    },
  },
  BEFORE_MOVE_IN_CALENDAR_DAYS_0: {
    withIn: {
      title: 'cms.cancellation_policy.card.with_in.title',
      desc: 'cms.cancellation_policy.card.with_in.check_in.desc',
      hasRules: true,
    },
    withOut: {
      title: 'cms.cancellation_policy.card.with_out.title',
      desc: 'cms.cancellation_policy.card.with_out.desc',
    },
  },
  other: {
    withIn: {
      title: 'cms.cancellation_policy.card.with_in.title',
      desc: 'cms.cancellation_policy.card.with_in.desc',
      hasRules: true,
    },
    withOut: {
      title: 'cms.cancellation_policy.card.with_out.title',
      desc: 'cms.cancellation_policy.card.with_out.desc',
    },
  },
};

export default longtailFreeCancellationPeriodOptions;
