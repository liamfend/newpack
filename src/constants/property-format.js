import { getBillingCycleText, getFreeCancellationPeriodText, getCancellationPeriodText,
  getRankTypeText, getCoordindateText,
  getAreaText, getLinksText, getRankTypeValue } from '~helpers/property-field-option';

// value: 值对应的property位置
// name: 字段名称的key
// displayValue: 显示的值，
//      若为数组则对应property的位置(如city的name)，若为函数，则使用函数取值
//      处理方法见getTextByValue
export const propertyFormatOption = {
  details: {
    name: {
      value: ['name'],
      name: 'cms.properties.edit.detail.property_name',
    },
    slug: {
      value: ['slug'],
      name: 'cms.properties.edit.detail.property_slug',
    },
    landlord: {
      value: ['landlord', 'name'],
      name: 'cms.properties.edit.detail.landlord',
    },
    country: {
      value: ['city', 'country', 'slug'],
      displayValue: ['city', 'country', 'name'],
      name: 'cms.properties.edit.detail.Country',
    },
    city: {
      value: ['city', 'slug'],
      displayValue: ['city', 'name'],
      name: 'cms.properties.edit.detail.City',
    },
    billingCycle: {
      value: ['billingCycle'],
      displayValue: getBillingCycleText,
      name: 'cms.properties.edit.detail.billing_cycle',
    },
    currency: {
      value: ['currency'],
      name: 'cms.properties.edit.detail.currency',
    },
    totalBeds: {
      value: ['totalBeds'],
      name: 'cms.properties.edit.detail.beds_number',
    },
    headlineCn: {
      value: ['headlineCn'],
      name: 'cms.properties.edit.detail.headline_cn',
    },
    descriptionCn: {
      value: ['descriptionCn'],
      name: 'cms.properties.edit.detail.desc_cn',
    },
    headline: {
      value: ['headline'],
      name: 'cms.properties.edit.detail.headline_en',
    },
    description: {
      value: ['description'],
      name: 'cms.properties.edit.detail.desc_en',
    },
    cancellationChecked: {
      value: ['cancellationChecked'],
      name: 'cms.properties.edit.detail.cancelation_policy.display_controller',
    },
    freeCancellationPeriod: {
      value: ['freeCancellationPeriod'],
      displayValue: getFreeCancellationPeriodText,
      name: 'cms.properties.edit.detail.free_cancellation_period',
    },
    cancellationPeriod: {
      value: ['cancellationPeriod'],
      displayValue: getCancellationPeriodText,
      name: 'cms.properties.edit.detail.cancellation_period',
    },
    noVisaNoPay: {
      value: ['noVisaNoPay'],
      name: 'cms.properties.edit.detail.cancelation_policy.no_visa_no_pay',
    },
    noPlaceNoPay: {
      value: ['noPlaceNoPay'],
      name: 'cms.properties.edit.detail.cancelation_policy.no_place_no_pay',
    },
    cancellationProcess: {
      value: ['cancellationProcess'],
      name: 'cms.properties.edit.detail.cancelation_policy',
    },
    covid19Policy: {
      value: ['covid19Policy'],
      name: 'cms.properties.edit.detail.cancelation_policy.covid_19',
    },
    rankType: {
      value: getRankTypeValue,
      displayValue: getRankTypeText,
      name: 'cms.properties.edit.others.ranking_type',
    },
    rank: {
      value: ['rank'],
      name: 'cms.properties.edit.others.ranking_value',
    },
  },
  address: {
    address: {
      value: ['address'],
      name: 'cms.properties.edit.address.address_line1',
    },
    addressLine_2: {
      value: ['addressLine2'],
      name: 'cms.properties.edit.address.address_line2',
    },
    postalCode: {
      value: ['zipCode'],
      name: 'cms.properties.edit.address.zip_code',
    },
    areaId: {
      value: ['areaId'],
      displayValue: getAreaText,
      name: 'cms.properties.edit.address.select_an_area',
    },
    country: {
      value: ['city', 'country', 'name'],
      name: 'cms.properties.edit.detail.Country',
    },
    city: {
      value: ['city', 'name'],
      name: 'cms.properties.edit.detail.City',
    },
    universities: {
      value: ['universities'],
      name: 'cms.properties.edit.detail.universities',
    },
    latitude: {
      value: ['latitude'],
      displayValue: getCoordindateText,
      name: 'cms.properties.edit.address.latitude',
    },
    longitude: {
      value: ['longitude'],
      displayValue: getCoordindateText,
      name: 'cms.properties.edit.address.longitude',
    },
    links: {
      value: ['links'],
      displayValue: getLinksText,
      name: 'cms.properties.edit.address.virtual_tour_link',
    },
  },
  facilities: {
  },
};

export const richTextFields = ['descriptionCn', 'description', 'cancellationProcess', 'covid19Policy'];

