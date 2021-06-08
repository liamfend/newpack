export const communicationStatus = {
  IDLE: 'idle',
  FETCHING: 'fetching',
  ERROR: 'error',
  CLIENT_ERROR: 'clientError',
  TIMEOUT: 'timeout',
}

export const storage = {
  keys: {
    filters: 'LANDLORD_LAST_FILTERS',
  },
  version: 'v1',
}

export const cookieNames = {
  token: 'CMSACCESSSESSION',
  landlordToken: 'LANDLORDACCESSSESSION',
}

export const addStatus = {
  content: 0,
  map: 1,
  admin: 2,
}

export const locales = [
  'EN_US',
  'EN_GB',
  'ZH_CN',
  'DE_DE',
  'EL_CY',
  'EL_GR',
  'ES_LA',
  'ES_ES',
  'FR_FR',
  'IT_IT',
  'JA_JP',
  'KO_KR',
  'PT_BR',
  'RU_RU',
  'TH_TH',
  'TR_TR',
  'ZH_HK',
  'ZH_TW',
  'VI_VN',
]

export const offerTypes = ['VOUCHER', 'DISCOUNT', 'CASHBACK', 'GROUP_OFFER', 'PROMOTION']

export const offerType = {
  VOUCHER: 'VOUCHER',
  DISCOUNT: 'DISCOUNT',
  CASHBACK: 'CASHBACK',
  GROUP_OFFER: 'GROUP_OFFER',
  PROMOTION: 'PROMOTION',
}

export const tenancyUnitTypes = ['MONTH', 'WEEK', 'DAY']

export const mapType = {
  property: 'property',
  city: 'city',
}

export const endDate = {
  yes: 'haveEndDate',
  no: 'notHaveEndDate',
}

export const offerCategory = {
  exclusive: true,
  nonExclusize: false,
}

export const operateType = {
  edit: 'edit',
  add: 'add',
}

export const displayForm = {
  page: 'page',
  modal: 'modal',
}

export const offerOwnerType = {
  student: 'INTERNAL',
  landlord: 'LANDLORD',
}

export const displayType = ['CN', 'GB', 'US', 'AU', 'IN', 'JP', 'KR']

export const displaySetting = {
  default: 'default',
  accordingIPAddress: 'according_ip_address',
}

export const userRole = 'content_manager'

export const landlordRole = 'landlord'

export const sortDirectionMapping = {
  ascend: 'ASCENDING',
  descend: 'DESCENDING',
  ASCENDING: 'ascend',
  DESCENDING: 'descend',
}

export const sortByMapping = {
  updatedAt: 'UPDATED_AT',
  unitType: 'UNIT_TYPE_ID',
  unitTypeName: 'UNIT_TYPE_NAME',
  distinctionTypeName: 'DISTINCTION_TYPE_NAME',
  distinctionName: 'DISTINCTION_NAME',
  price: 'PRICE_MIN',
  startDate: 'START_DATE',
  endDate: 'END_DATE',
  maxBookings: 'MAX_BOOKINGS',
  createdAt: 'CREATED_AT',
  amount: 'AMOUNT',
  UPDATED_AT: 'updatedAt',
  UNIT_TYPE_ID: 'unitType',
  UNIT_TYPE_NAME: 'unitTypeName',
  DISTINCTION_NAME: 'distinctionName',
  DISTINCTION_TYPE_NAME: 'distinctionTypeName',
  PRICE_MIN: 'price',
  NAME: 'NAME',
}

export const countrySortByMapping = {
  countrySlug: 'SLUG',
  countryCode: 'COUNTRY_CODE',
  currencyCode: 'CURRENCY_CODE',
  numOfProperties: 'PUBLISHED_PROPERTIES',
  updatedAt: 'UPDATED_AT',
}

export const citySortByMapping = {
  updatedAt: 'UPDATED_AT',
  name: 'NAME',
  numOfProperties: 'PROPERTIES',
  rank: 'RANK',
}

export const areaSortByMapping = {
  name: 'NAME',
  updatedAt: 'UPDATED_AT',
  numOfProperties: 'PUBLISHED_PROPERTIES',
}

export const universitySortByMapping = {
  commonNamesCount: 'NAME',
  updatedAt: 'UPDATED_AT',
}

export const accountSortByMapping = {
  updatedAt: 'UPDATED_AT',
}

export const propertyListingForm = {
  statuses: {
    new: 'NEW',
    drafts: 'DRAFTS',
    published: 'PUBLISHED',
    unpublished: 'UNPUBLISHED',
    editing: 'EDITING',
  },
  listingType: {
    fixed: 'FIXED',
    fixedOpenEnd: 'FIXED_OPEN_END',
    flexible: 'FLEXIBLE',
    flexibleOpenEnd: 'FLEXIBLE_OPEN_END',
    placeholder: 'PLACEHOLDER',
  },
  availability: {
    good: 'GOOD',
    limited: 'LIMITED',
    soldOut: 'SOLD_OUT',
  },
  discountType: {
    no: 'NO',
    absolute: 'ABSOLUTE',
    percentage: 'PERCENTAGE',
  },
  priceType: {
    exact: 'EXACT',
    range: 'RANGE',
  },
}

export const unitTypesForm = {
  category: {
    ensuiteRoom: 'ENSUITE_ROOM',
    entirePlace: 'ENTIRE_PLACE',
    privateRoom: 'PRIVATE_ROOM',
    sharedRoom: 'SHARED_ROOM',
    studio: 'STUDIO',
  },
  roomArrangement: {
    cluster: 'CLUSTER',
    apartment: 'APARTMENT',
    hotelStyle: 'HOTEL_STYLE',
  },
  floorplanAreaDisplayUnit: {
    sqft: 'SQFT',
    m2: 'M2',
  },
  genderMix: {
    maleOnly: 'MALE_ONLY',
    femaleOnly: 'FEMALE_ONLY',
    mixed: 'MIXED',
  },
  dietaryPreference: {
    vegetarian: 'VEGETARIAN',
  },
  smokingPreference: {
    nonSmoking: 'NON_SMOKING',
    smoking: 'SMOKING',
  },
  bathroomTypes: {
    privateEnsuite: 'PRIVATE_ENSUITE',
    privateNonEnsuite: 'PRIVATE_NON_ENSUITE',
    sharedEnsuite: 'SHARED_ENSUITE',
    sharedNonEnsuite: 'SHARED_NON_ENSUITE',
    mixed: 'MIXED',
  },
}

export const googleMapKey = 'AIzaSyAo3z-iOKf-Mto5TsHcsjXylWdxCt7zZDk'

export const updateMutation = {
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  INSERT: 'INSERT',
  NEW: 'NEW',
}

export const propertyState = {
  AVAILABLE_WITH_PRICE: 'AVAILABLE_WITH_PRICE',
  AVAILABLE: 'AVAILABLE',
  COMING_SOON: 'COMING_SOON',
  SOLD_OUT: 'SOLD_OUT',
  INACTIVE: 'INACTIVE',
}

export const locationType = {
  COUNTRY_TYPE: 'Country',
  CITY_TYPE: 'City',
  AREA_TYPE: 'Area',
  UNIVERSITY_TYPE: 'University',
}

export const locationTabType = {
  DETAILS: 'details',
  CONTENT: 'content',
  SEO: 'seo',
}

export const depositType = {
  FIXED_AMOUNT: 'FIXED_AMOUNT',
  PER_BILLING_CYCLE: 'PER_BILLING_CYCLE',
  DEPOSIT_PERCENTAGE: 'DEPOSIT_PERCENTAGE',
}

export const draftType = {
  EDITING: 'EDITING',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
}

export const platformEntity = {
  PROPERTIES_PROPERTIES: 'properties.properties',
  PROPERTIES_UNIT_TYPES: 'properties.unit_types',
  LISTINGS_LISTINGS: 'listings.listings',
  COMMISSION_COMISSION_TIERS: 'commission.commission_tiers',
  PROPERTIES_TERMS: 'payments.terms_and_conditions',
  PROPERTIES_PROPERTIES_CONTRACTS: 'properties.property_contracts',
  PAYMENTS_LINE_ITEM_RULES: 'payments.line_item_rules',
  LOCATIONS_COUNTRIES: 'locations.countries',
  LOCATIONS_CITIES: 'locations.cities',
  LOCATIONS_AREAS: 'locations.areas',
  UNIVERSITIES_UNIVERSITIES: 'universities.universities',
  PROPERTIES_CONTRACTS: 'properties.contracts',
  SPECIAL_OFFERS_SPECIAL_OFFERS: 'special_offers.special_offers',
  IDENTITY_CMS_USERS: 'identity.cms_users',
  LANDLORDS_LANDLORDS: 'landlords.landlords',
  REVIEWS_REVIEWS: 'reviews.reviews',
  ORDER_TRANSFERS: 'payments.order_transfers',
  ORDER_RECEIVES: 'payments.order_receivables',
  ORDER_REFUNDS: 'payments.order_refunds',
  BOOKINGS_OPPORTUNITIES: 'bookings.opportunities',
}
export const entityAction = {
  CREATE: 'C',
  READ: 'R',
  UPDATE: 'U',
  DELETE: 'D',
}

export const pmsAllowRoles = [
  'admin',
  'pms_landlord',
  'content_manager_level_2',
  'content_manager',
  'regional_supply_head',
  'supply',
  'financial',
]

export const createCmsUserType = {
  EMAIL: 'EMAIL',
}

export const contractStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  EXPIRED: 'EXPIRED',
}

export const mappingRoles = {
  ADMIN: 'admin',
  CONTENT_MANAGER_LEVEL_2: 'content_manager_level_2',
  CONTENT_MANAGER: 'content_manager',
  REGIONAL_SUPPLY_HEAD: 'regional_supply_head',
  SUPPLY: 'supply',
  FINANCIAL: 'financial',
}
