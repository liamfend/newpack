
export const freeCancellationPeriodOptions = [
  { value: 'HOURS_24', text: 'cms.properties.edit.detail.free_cancellation_period.24_hours' },
  { value: 'HOURS_48', text: 'cms.properties.edit.detail.free_cancellation_period.48_hours' },
  { value: 'HOURS_72', text: 'cms.properties.edit.detail.free_cancellation_period.72_hours' },
  { value: 'BUSINESS_DAYS_5', text: 'cms.properties.edit.detail.free_cancellation_period.5_business_days' },
  { value: 'CALENDAR_DAYS_5', text: 'cms.properties.edit.detail.free_cancellation_period.5_calendar_days' },
  { value: 'CALENDAR_DAYS_7', text: 'cms.properties.edit.detail.free_cancellation_period.7_calendar_days' },
  { value: 'CALENDAR_DAYS_14', text: 'cms.properties.edit.detail.free_cancellation_period.14_calendar_days' },
  { value: 'CALENDAR_DAYS_28', text: 'cms.properties.edit.detail.free_cancellation_period.28_calendar_days' },
  { value: 'UNTIL_THE_STUDENT_PAYS_FOR_THE_RENT', text: 'cms.properties.edit.detail.free_cancellation_period.until_the_student_pays_for_the_rent' },
  { value: 'NO_COOLING_OFF_PERIOD', text: 'cms.properties.edit.detail.free_cancellation_period.no_cooling_off_period' },
  { value: 'OTHER', text: 'cms.properties.edit.detail.free_cancellation_period.other' },
];

export const longtailFreeCancellationPeriodOptions = [
  { value: 'BEFORE_MOVE_IN_CALENDAR_DAYS_0', text: 'cms.properties.edit.detail.cancellation_period.0_calendar_days' },
  { value: 'BEFORE_MOVE_IN_CALENDAR_DAYS_7', text: 'cms.properties.edit.detail.cancellation_period.7_calendar_days' },
  { value: 'BEFORE_MOVE_IN_CALENDAR_DAYS_14', text: 'cms.properties.edit.detail.cancellation_period.14_calendar_days' },
  { value: 'BEFORE_MOVE_IN_CALENDAR_DAYS_30', text: 'cms.properties.edit.detail.cancellation_period.30_calendar_days' },
  { value: 'BEFORE_MOVE_IN_CALENDAR_DAYS_60', text: 'cms.properties.edit.detail.cancellation_period.60_calendar_days' },
  { value: 'BEFORE_MOVE_IN_CALENDAR_DAYS_90', text: 'cms.properties.edit.detail.cancellation_period.90_calendar_days' },
  { value: 'NON_REFUNDABLE', text: 'cms.properties.edit.detail.cancellation_period.non_refundable' },
];

export const draftLongtailCancellationPeriod = {
  '0_calendar_days_before_move_in': 'BEFORE_MOVE_IN_CALENDAR_DAYS_0',
  '7_calendar_days_before_move_in': 'BEFORE_MOVE_IN_CALENDAR_DAYS_7',
  '14_calendar_days_before_move_in': 'BEFORE_MOVE_IN_CALENDAR_DAYS_14',
  '30_calendar_days_before_move_in': 'BEFORE_MOVE_IN_CALENDAR_DAYS_30',
  '60_calendar_days_before_move_in': 'BEFORE_MOVE_IN_CALENDAR_DAYS_60',
  '90_calendar_days_before_move_in': 'BEFORE_MOVE_IN_CALENDAR_DAYS_90',
  non_refundable: 'NON_REFUNDABLE',
};

export const billingCycleOptions = [
  { value: 'DAYLY', text: 'cms.properties.edit.detail.billing_cycle.option_day' },
  { value: 'WEEKLY', text: 'cms.properties.edit.detail.billing_cycle.option_week' },
  { value: 'MONTHLY', text: 'cms.properties.edit.detail.billing_cycle.option_month' },
];

export const typeOptions = [
  { value: 'student-accommodation', text: 'cms.properties.edit.detail.type.student-accommodation' },
  { value: 'multi-family', text: 'cms.properties.edit.detail.type.multi-family' },
  { value: 'long-tail', text: 'cms.properties.edit.detail.type.long-tail' },
  { value: 'hotel', text: 'cms.properties.edit.detail.type.hotel' },
  { value: 'serviced-apartment', text: 'cms.properties.edit.detail.type.serviced-apartment' },
  { value: 'real-estate-agent', text: 'cms.properties.edit.detail.type.real-estate-agent' },
];

export const rankTypeOptions = [
  { value: 'NORMAL', text: 'cms.properties.edit.tab_label.others.ranking_type_normal' },
  { value: 'STAR', text: 'cms.properties.edit.tab_label.others.ranking_type_star' },
  { value: 'BLACKSHEEP', text: 'cms.properties.edit.tab_label.others.ranking_type_black_sheep' },
];
