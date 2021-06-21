export const allCommissionCategories = {
  NUM_BOOKINGS: 'NUM_BOOKINGS',
  TENANCY_LENGTH: 'TENANCY_LENGTH',
  REBOOKERS_COMMISSION: 'REBOOKERS_COMMISSION',
  FLAT_FEE: 'FLAT_FEE',
};

export const defaultField = [
  'category', 'name', 'bonus', 'type', 'value', 'effectiveFrom',
  'effectiveTo', 'checkInDateFrom', 'checkInDateTo',
];

export const numBookings = [
  'convertedCalculationValue', 'capType', 'capValue',
  'tenancyLengthFrom', 'tenancyLengthTo',
  'tenancyUnit', 'bookingCountFrom', 'bookingCountTo', 'fullyCalculatable',
  'retrospectiveCommission', 'description',
];

export const tenancyLength = [
  'convertedCalculationValue', 'capType', 'capValue',
  'tenancyUnit', 'tenancyLengthFrom', 'tenancyLengthTo',
  'fullyCalculatable', 'retrospectiveCommission', 'description',
];

export const flatFee = [
  'convertedCalculationValue', 'tenancyUnit',
  'tenancyLengthFrom', 'tenancyLengthTo',
  'capType', 'capValue',
  'bookingCountFrom', 'bookingCountTo',
  'fullyCalculatable', 'description',
];

export const commissionCategories = ['REBOOKERS_COMMISSION', 'FLAT_FEE', 'NUM_BOOKINGS', 'TENANCY_LENGTH'];

export const commissionStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  EXPIRE: 'EXPIRE',
};

export default allCommissionCategories;
