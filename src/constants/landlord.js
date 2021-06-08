import { mappingRoles } from '~constants';

export const contractStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  EXPIRED: 'EXPIRED',
};

export const landlordDetailTabs = {
  DETAILS: 'DETAILS',
  CONTACT: 'CONTACT',
  PROPERTY_RELATED: 'PROPERTY_RELATED',
};

export const reconciliationOption = ['BOOKING_COMPLETED', 'STUDENT_CHECK_IN', 'STUDENT_CHECK_OUT'];

export const reconciliationFrequencies = ['MONTHLY', 'QUARTERLY'];

export const invoicingFrequencies = ['MONTHLY', 'QUARTERLY', 'YEARLY'];

export const propertyStatus = {
  NEW: 'NEW',
  EDITING: 'EDITING',
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
};

export const allPaymentMethod = {
  STRIPE: 'STRIPE',
  VIRTUAL_CREDIT_CARD: 'VIRTUAL_CREDIT_CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
};

export const transferStatus = {
  NEW: 'NEW',
  PENDING_TRANSFER: 'PENDING_TRANSFER',
  TRANSFERRED: 'TRANSFERRED',
};

export const refundStatus = {
  NEW: 'NEW',
  PENDING_REFUND: 'PENDING_REFUND',
  REFUND_CONFIRMATION: 'REFUND_CONFIRMATION',
  REFUNDED: 'REFUNDED',
};

export const refundFromTypes = {
  ACCOMMODATION_PARTNER: 'ACCOMMODATION_PARTNER',
  STCOM: 'STCOM',
};

export const bankTransfer = {
  accountNumber: 'account_number',
  nameOfBeneficiary: 'name_of_beneficiary',
  beneficiaryAddress: 'beneficiary_address',
  bankName: 'bank_name',
  ibanNumber: 'iban_number',
  routingNumber: 'routing_number',
  sortCode: 'sort_code',
  bicOrSwiftCode: 'bic_or_swift_code',
  recipientsFullName: 'recipients_full_name',
  streetAddress: 'street_address',
  bsb: 'bsb',
  swiftCode: 'swift_code',
  accountHolderName: 'account_holder_name',
  address: 'address',
  branchName: 'branch_name',
  branchAddress: 'branch_address',
  beneficiaryBankName: 'beneficiary_bank_name',
  bankAddress: 'bank_address',
  addressOfBeneficiary: 'address_of_beneficiary',
  nameOfFrenchBank: 'name_of_french_bank',
  addressOfFrenchBank: 'address_of_french_bank',
  accountName: 'account_name',
  beneficiaryName: 'beneficiary_name',
  beneficiaryAccountNumber: 'beneficiary_account_number',
};

export const includeRoleArr = [
  mappingRoles.SUPPLY,
  mappingRoles.REGIONAL_SUPPLY_HEAD,
  mappingRoles.ADMIN,
  mappingRoles.CONTENT_MANAGER,
];
export const viewLandlordAccountOwnerRoleArr = [
  mappingRoles.SUPPLY,
  mappingRoles.REGIONAL_SUPPLY_HEAD,
  mappingRoles.ADMIN,
  mappingRoles.CONTENT_MANAGER,
];
export const editLandlordAccountOwnerRoleArr = [
  mappingRoles.SUPPLY,
  mappingRoles.REGIONAL_SUPPLY_HEAD,
  mappingRoles.ADMIN,
  mappingRoles.CONTENT_MANAGER,
];
